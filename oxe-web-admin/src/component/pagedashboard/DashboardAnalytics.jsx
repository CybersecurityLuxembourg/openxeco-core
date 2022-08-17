import React from "react";
import "./DashboardAnalytics.css";
import { NotificationManager as nm } from "react-notifications";
import { Line } from "react-chartjs-2";
import { getRequest } from "../../utils/request.jsx";
import Loading from "../box/Loading.jsx";
import Message from "../box/Message.jsx";
import CheckBox from "../button/CheckBox.jsx";

export default class DashboardAnalytics extends React.Component {
	constructor(props) {
		super(props);

		this.getLabels = this.getLabels.bind(this);

		this.state = {
			activity: null,
			granularities: ["DAY", "WEEK", "MONTH"],
			selectedGranularity: "DAY",
			periods: ["LAST WEEK", "LAST MONTH", "LAST YEAR"],
			selectedPeriod: "LAST WEEK",
		};
	}

	componentDidMount() {
		this.refresh();
	}

	refresh() {
		this.getAnalytics();
	}

	getAnalytics() {
		this.setState({ activity: null }, () => {
			getRequest.call(this, "analytics/get_ecosystem_activity", (data) => {
				this.setState({
					activity: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	getLineData(dictData) {
		const labels = this.getLabels(dictData);

		return {
			labels,
			datasets: [{
				data: DashboardAnalytics.getData(dictData, labels),
				borderWidth: 1,
				borderColor: "#009fe3",
				backgroundColor: "#bcebff",
			}],
		};
	}

	static getLineOptions() {
		return {
			legend: {
				display: false,
			},
			scales: {
				yAxes: [
					{
						ticks: {
							precision: 0,
							beginAtZero: true,
						},
						gridLines: {
							drawBorder: true,
							lineWidth: 0,
						},
					},
				],
				xAxes: [
					{
						gridLines: {
							drawBorder: true,
							lineWidth: 0,
						},
					},
				],
			},
		};
	}

	getLabels(dictData) {
		const labels = [];

		// Defining the min date of the range

		let minDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1));

		switch (this.state.selectedPeriod) {
		case "LAST WEEK":
			minDate = new Date(new Date().setDate(new Date().getDate() - 7));
			break;
		case "LAST MONTH":
			minDate = new Date(new Date().setDate(new Date().getDate() - 31));
			break;
		case "LAST YEAR":
			minDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
			break;
		default:
			minDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
		}

		// Defining the max date of the range

		const maxDateFromDict = Object.keys(dictData).sort().slice(-1)[0];
		const maxDate = maxDateFromDict && maxDateFromDict > new Date().toISOString().slice(0, 10)
			? maxDateFromDict
			: new Date();

		// Build labels according to the granularity

		switch (this.state.selectedGranularity) {
		case "DAY":
			while (minDate <= maxDate) {
				labels.push(minDate.toISOString().slice(0, 10));
				minDate.setDate(minDate.getDate() + 1);
			}
			break;
		case "WEEK": {
			const currentSunday = new Date(
				minDate.getFullYear(),
				minDate.getMonth(),
				minDate.getDate() + (8 - minDate.getDay()),
			);

			labels.push(DashboardAnalytics.formatLabel(minDate, currentSunday));
			currentSunday.setDate(currentSunday.getDate() + 7);

			while (currentSunday <= maxDate) {
				const matchingMonday = new Date(currentSunday.getTime() - 6 * 24 * 60 * 60 * 1000);

				labels.push(
					DashboardAnalytics.formatLabel(
						matchingMonday,
						currentSunday,
					),
				);
				currentSunday.setTime(currentSunday.getTime() + 7 * 24 * 60 * 60 * 1000);
			}
			break;
		}
		case "MONTH": {
			const firstDayOfNextMonth = new Date(
				minDate.getFullYear(),
				minDate.getMonth() + 1,
				2,
			);

			labels.push(DashboardAnalytics.formatLabel(minDate, firstDayOfNextMonth));
			firstDayOfNextMonth.setMonth(firstDayOfNextMonth.getMonth() + 1);

			while (firstDayOfNextMonth <= maxDate) {
				labels.push(DashboardAnalytics.formatLabel(
					firstDayOfNextMonth,
					new Date(firstDayOfNextMonth.getFullYear(), firstDayOfNextMonth.getMonth() + 1, 1),
				));

				firstDayOfNextMonth.setMonth(firstDayOfNextMonth.getMonth() + 1);
			}
			break;
		}
		default:
			break;
		}

		return labels;
	}

	static getData(dictData, labels) {
		if (labels.length === 0) {
			return [];
		}

		if (labels[0].length <= 10) {
			return labels
				.map((l) => (dictData[l] ? dictData[l] : 0));
		}

		return labels
			.map((l) => [l.substr(0, 10), l.substr(l.length - 10)])
			.map((l) => Object.keys(dictData)
				.filter((k) => l[0] <= k && k <= l[1])
				.map((d) => dictData[d])
				.reduce((a, b) => a + b, 0));
	}

	static formatLabel(date1, date2) {
		return date1.toISOString().slice(0, 10)
			+ " - "
			+ date2.toISOString().slice(0, 10);
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div id="DashboardAnalytics">
				<div className={"row"}>
					<div className="col-md-9">
						<h1>Usage analytics</h1>
					</div>

					<div className="col-md-3">
						<div className="top-right-buttons">
							<button
								onClick={() => this.refresh()}>
								<i className="fas fa-redo-alt"/>
							</button>
						</div>
					</div>
				</div>

				<div className={"row"}>
					<div className="col-md-12">
						{this.state.periods
							.map((t) => <CheckBox
								key={t}
								label={t}
								value={t === this.state.selectedPeriod}
								onClick={() => this.changeState("selectedPeriod", t)}
							/>)}
					</div>

					<div className="col-md-12">
						{this.state.granularities
							.map((t) => <CheckBox
								key={t}
								label={t}
								value={t === this.state.selectedGranularity}
								onClick={() => this.changeState("selectedGranularity", t)}
							/>)}
					</div>

					<div className="col-md-12">
						<h2>Users</h2>
					</div>

					<div className="col-md-6 row-spaced">
						<h3>Number of user creation</h3>

						{this.state.activity
							? <div>
								{Object.keys(this.state.activity.account_creation).length > 0
									? <Line
										data={this.getLineData(this.state.activity.account_creation)}
										options={DashboardAnalytics.getLineOptions()}
									/>
									: <Message
										text={"No data found"}
										height={150}
									/>
								}
							</div>
							: <Loading
								height={150}
							/>
						}
					</div>

					<div className="col-md-6 row-spaced">
						<h3>Number of user actions</h3>

						{this.state.activity
							? <div>
								{Object.keys(this.state.activity.action).length > 0
									? <Line
										data={this.getLineData(this.state.activity.action)}
										options={DashboardAnalytics.getLineOptions()}
									/>
									: <Message
										text={"No data found"}
										height={150}
									/>
								}
							</div>
							: <Loading
								height={150}
							/>
						}
					</div>

					<div className="col-md-12">
						<h2>Articles</h2>
					</div>

					<div className="col-md-6 row-spaced">
						<h3>Number of news publicated by the community</h3>

						{this.state.activity
							? <div>
								{Object.keys(this.state.activity.news_publication).length > 0
									? <Line
										data={this.getLineData(this.state.activity.news_publication)}
										options={DashboardAnalytics.getLineOptions()}
									/>
									: <Message
										text={"No data found"}
										height={150}
									/>
								}
							</div>
							: <Loading
								height={150}
							/>
						}
					</div>

					<div className="col-md-6 row-spaced">
						<h3>Number of events publicated by the community</h3>

						{this.state.activity
							? <div>
								{Object.keys(this.state.activity.event_publication).length > 0
									? <Line
										data={this.getLineData(this.state.activity.event_publication)}
										options={DashboardAnalytics.getLineOptions()}
									/>
									: <Message
										text={"No data found"}
										height={150}
									/>
								}
							</div>
							: <Loading
								height={150}
							/>
						}
					</div>

					<div className="col-md-6 row-spaced">
						<h3>Number of job offers publicated by the community</h3>

						{this.state.activity
							? <div>
								{Object.keys(this.state.activity.job_offer_publication).length > 0
									? <Line
										data={this.getLineData(this.state.activity.job_offer_publication)}
										options={DashboardAnalytics.getLineOptions()}
									/>
									: <Message
										text={"No data found"}
										height={150}
									/>
								}
							</div>
							: <Loading
								height={150}
							/>
						}
					</div>

					<div className="col-md-6 row-spaced">
						<h3>Number of services publicated by the community</h3>

						{this.state.activity
							? <div>
								{Object.keys(this.state.activity.service_publication).length > 0
									? <Line
										data={this.getLineData(this.state.activity.service_publication)}
										options={DashboardAnalytics.getLineOptions()}
									/>
									: <Message
										text={"No data found"}
										height={150}
									/>
								}
							</div>
							: <Loading
								height={150}
							/>
						}
					</div>

					<div className="col-md-6 row-spaced">
						<h3>Number of tools publicated by the community</h3>

						{this.state.activity
							? <div>
								{Object.keys(this.state.activity.tool_publication).length > 0
									? <Line
										data={this.getLineData(this.state.activity.tool_publication)}
										options={DashboardAnalytics.getLineOptions()}
									/>
									: <Message
										text={"No data found"}
										height={150}
									/>
								}
							</div>
							: <Loading
								height={150}
							/>
						}
					</div>

					<div className="col-md-6 row-spaced">
						<h3>Number of resources publicated by the community</h3>

						{this.state.activity
							? <div>
								{Object.keys(this.state.activity.resource_publication).length > 0
									? <Line
										data={this.getLineData(this.state.activity.resource_publication)}
										options={DashboardAnalytics.getLineOptions()}
									/>
									: <Message
										text={"No data found"}
										height={150}
									/>
								}
							</div>
							: <Loading
								height={150}
							/>
						}
					</div>
				</div>
			</div>
		);
	}
}
