import React from "react";
import "./DashboardAnalytics.css";
import { NotificationManager as nm } from "react-notifications";
import { Line } from "react-chartjs-2";
import { getRequest } from "../../utils/request.jsx";
import Loading from "../box/Loading.jsx";
import Message from "../box/Message.jsx";

export default class DashboardAnalytics extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			activity: null,
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

	static getLineData(dictData) {
		return {
			labels: Object.keys(dictData),
			datasets: [{
				data: Object.values(dictData),
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
							beginAtZero: true,
						},
						gridLines: {
							display: false,
						},
					},
				],
			},
		};
	}

	render() {
		return (
			<div className={"page max-sized-page"}>
				<div className={"row row-spaced"}>
					<div className="col-md-6 row-spaced">
						<h3>Number of logins from ecosystem users</h3>

						{this.state.activity
							? <div>
								{Object.keys(this.state.activity.account_login).length > 0
									? <Line
										data={DashboardAnalytics.getLineData(this.state.activity.account_login)}
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
						<h3>Number of user creation</h3>

						{this.state.activity
							? <div>
								{Object.keys(this.state.activity.account_creation).length > 0
									? <Line
										data={DashboardAnalytics.getLineData(this.state.activity.account_creation)}
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
										data={DashboardAnalytics.getLineData(this.state.activity.action)}
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
						<h3>Number of news publicated by the ecosystem</h3>

						{this.state.activity
							? <div>
								{Object.keys(this.state.activity.news_publication).length > 0
									? <Line
										data={DashboardAnalytics.getLineData(this.state.activity.news_publication)}
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
						<h3>Number of events publicated by the ecosystem</h3>

						{this.state.activity
							? <div>
								{Object.keys(this.state.activity.event_publication).length > 0
									? <Line
										data={DashboardAnalytics.getLineData(this.state.activity.event_publication)}
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
						<h3>Number of job offers publicated by the ecosystem</h3>

						{this.state.activity
							? <div>
								{Object.keys(this.state.activity.job_offer_publication).length > 0
									? <Line
										data={DashboardAnalytics.getLineData(this.state.activity.job_offer_publication)}
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
