import React from "react";
import "./PageDashboard.css";
import { NotificationManager as nm } from "react-notifications";
import CountUp from "react-countup";
import { Bar } from "react-chartjs-2";
import { getRequest } from "../utils/request.jsx";
import Loading from "./box/Loading.jsx";
import Filter from "./box/Filter.jsx";
import Message from "./box/Message.jsx";
import Company from "./item/Company.jsx";
import User from "./item/User.jsx";
import BarActorAge from "./chart/BarActorAge.jsx";
import BarWorkforceRange from "./chart/BarWorkforceRange.jsx";
import TreeMap from "./chart/TreeMap.jsx";
import { getPastDate } from "../utils/date.jsx";

export default class PageDashboard extends React.Component {
	constructor(props) {
		super(props);

		this.getAnalytics = this.getAnalytics.bind(this);
		this.filterActors = this.filterActors.bind(this);
		this.getTreeValues = this.getTreeValues.bind(this);
		this.manageFilter = this.manageFilter.bind(this);
		this.getTotalEmployees = this.getTotalEmployees.bind(this);

		this.state = {
			analytics: null,
			filters: {},
			filteredActors: null,
		};
	}

	componentDidMount() {
		this.getAnalytics();
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.filters !== this.state.filters
			|| prevState.analytics !== this.state.analytics) {
			this.filterActors();
		}
	}

	getAnalytics() {
		getRequest.call(this, "analytic/get_global_analytics", (data) => {
			this.setState({
				analytics: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	/**
	 * Function to add or remove a filter
	 * @param {axis} Name of the filter (such as "role", "is_startup", ...)
	 * @param {value} Value of the filter (such as name of role, boolean, ...)
	 * @param {add} The filter will be added if true, the filter will be removed otherwise
	 */
	manageFilter(axis, value, add) {
		if (Object.keys(this.state.analytics).indexOf(axis) >= 0) {
			if (add) {
				if (Object.keys(this.state.filters).indexOf(axis) >= 0) {
					if (this.state.filters[axis].indexOf(value) < 0) {
						const filters = JSON.parse(JSON.stringify(this.state.filters));
						filters[axis].push(value);
						this.setState({ filters });
					}
				} else {
					const filters = JSON.parse(JSON.stringify(this.state.filters));
					filters[axis] = [value];
					this.setState({ filters });
				}
			} else if (Object.keys(this.state.filters).indexOf(axis) >= 0) {
				if (this.state.filters[axis].indexOf(value) >= 0) {
					const filters = JSON.parse(JSON.stringify(this.state.filters));
					filters[axis] = filters[axis].filter((o) => o !== value);
					this.setState({ filters });
				}
			}
		} else if (add) {
			const filters = JSON.parse(JSON.stringify(this.state.filters));
			filters[axis] = value;
			this.setState({ filters });
		} else {
			const filters = JSON.parse(JSON.stringify(this.state.filters));
			delete filters[axis];
			this.setState({ filters });
		}
	}

	/**
	 * Filter the actors according to the selection defined in this.state.filters
	 * The result is set in this.state.filteredActors
	 */
	filterActors() {
		if (this.state.analytics === null) return;

		let filteredActors = this.state.analytics.actors.map((o) => o);

		for (let key = 0; key < Object.keys(this.state.filters).length; key++) {
			const axis = Object.keys(this.state.filters)[key];

			if (axis === "taxonomy_values") {
				// Filter taxonomy values

				for (let i = 0; i < this.state.filters[axis].length; i++) {
					const tmpFilteredActors = [];

					const valueName = this.state.filters[axis][i];
					const value = this.state.analytics.taxonomy_values
						.filter((v) => v.name === valueName)[0];

					// Get the child values to accept

					let values = [value];
					let childReached = false;

					while (!childReached) {
						const parentValues = values.map((v) => v.id);
						const childValues = this.state.analytics.taxonomy_value_hierarchy
							.filter((h) => parentValues.indexOf(h.parent_value) >= 0)
							.map((h) => h.child_value);

						if (childValues.length > 0) {
							values = this.state.analytics.taxonomy_values
								.filter((v) => childValues.indexOf(v.id) >= 0);
						} else {
							childReached = true;
						}
					}

					// Filter the companies according to the assignment

					const acceptedValueIDs = values.map((v) => v.id);

					filteredActors.forEach((filteredActor) => {
						const companyValues = this.state.analytics.taxonomy_assignments
							.filter((a) => a.company === filteredActor.id)
							.map((a) => a.taxonomy_value);

						if (acceptedValueIDs.filter((e) => companyValues.indexOf(e) >= 0).length > 0) {
							tmpFilteredActors.push(filteredActor);
						}
					});

					filteredActors = tmpFilteredActors;
				}
			} else if (axis === "size_range") {
				// Filter the selected size range
				const tmpFilteredActors = [];

				filteredActors.forEach((filteredActor) => {
					const workforces = this.state.analytics.workforces
						.filter((w) => w.company === filteredActor.id);

					if (workforces.length > 0
						&& this.state.filters.size_range[0] <= workforces[0].workforce
						&& workforces[0].workforce <= this.state.filters.size_range[1]) {
						tmpFilteredActors.push(filteredActor);
					}
				});

				filteredActors = tmpFilteredActors;
			} else if (axis === "age_range") {
				// Filter the selected age range

				const maxDate = getPastDate(this.state.filters.age_range[0]);
				const minDate = getPastDate(this.state.filters.age_range[1] + 1);

				filteredActors = filteredActors
					.filter((o) => minDate < o.creation_date && o.creation_date <= maxDate);
			} else {
				// Filter the selected company attribute such as is_cybersecurity_core_business, ...

				filteredActors = filteredActors
					.filter((o) => o[axis] === (this.state.filters[axis] ? 1 : 0));
			}
		}

		this.setState({
			filteredActors,
		});
	}

	/**
	 * Get the values to feed the tree charts
	 * @param {category} Name of the taxonomy category of the tree chart
	 */
	getTreeValues(category) {
		if (this.state.analytics === null || this.state.filteredActors === null) return [];

		const output = [];
		const dictOutput = {};

		const parentCategories = this.state.analytics.taxonomy_category_hierarchy
			.map((h) => h.parent_category);

		if (parentCategories.indexOf(category) < 0) {
			const companyIDs = this.state.filteredActors.map((o) => o.id);
			const values = this.state.analytics.taxonomy_values
				.filter((v) => v.category === category);
			const valueIDs = values.map((v) => v.id);
			const assignments = this.state.analytics.taxonomy_assignments
				.filter((a) => valueIDs.indexOf(a.taxonomy_value) >= 0)
				.filter((a) => companyIDs.indexOf(a.company) >= 0);

			for (let i = 0; i < assignments.length; i++) {
				if (assignments[i].taxonomy_value in dictOutput) {
					dictOutput[assignments[i].taxonomy_value] += 1;
				} else {
					dictOutput[assignments[i].taxonomy_value] = 1;
				}
			}

			for (let k = 0; k < Object.keys(dictOutput).length; k++) {
				const key = Object.keys(dictOutput)[k];
				output.push({
					value: values.filter((v) => v.id === parseInt(key, 10))[0].name,
					amount: dictOutput[key],
				});
			}
		} else {
			//
			//	This section if the asked category is not a child one
			//

			const values = this.state.analytics.taxonomy_values
				.filter((v) => v.category === category);

			let childReached = false;
			let currentCategory = category;

			// Build the dict with the children values of category

			for (let i = 0; i < values.length; i++) {
				dictOutput[values[i].id] = [values[i].id];
			}

			while (!childReached) {
				const childCategories = [];

				for (let i = 0; i < this.state.analytics.taxonomy_category_hierarchy.length; i++) {
					if (this.state.analytics.taxonomy_category_hierarchy[i].parent_category
						=== currentCategory) {
						childCategories.push(this.state.analytics.taxonomy_category_hierarchy[i]);
					}
				}

				if (childCategories.length > 0) {
					currentCategory = childCategories[0].child_category;

					for (let k = 0; k < Object.keys(dictOutput).length; k++) {
						const key = Object.keys(dictOutput)[k];
						dictOutput[key] = this.state.analytics.taxonomy_value_hierarchy
							.filter((h) => dictOutput[key].indexOf(h.parent_value) >= 0)
							.map((h) => h.child_value);
					}
				} else {
					childReached = true;
				}
			}

			// Build the distribution per company

			const companyDistribution = {};
			const companyIDs = this.state.filteredActors.map((o) => o.id);

			for (let i = 0; i < companyIDs.length; i++) {
				companyDistribution[companyIDs[i]] = [];
				const companyAssignments = this.state.analytics.taxonomy_assignments
					.filter((a) => a.company === companyIDs[i]);

				for (let y = 0; y < companyAssignments.length; y++) {
					for (let k = 0; k < dictOutput.length; k++) {
						if (dictOutput[k].indexOf(companyAssignments[y].taxonomy_value) >= 0
							&& companyDistribution[companyAssignments[y].company]
								.indexOf(k) < 0) companyDistribution[companyAssignments[y].company].push(k);
					}
				}
			}

			// Do the final count

			const companyDistributionCount = {};

			for (let i = 0; i < values.length; i++) {
				companyDistributionCount[values[i].id] = 0;
			}

			for (let k = 0; k < companyDistribution.length; k++) {
				for (let i = 0; i < companyDistribution[k].length; i++) {
					companyDistributionCount[companyDistribution[k][i]] += 1;
				}
			}

			for (let k = 0; k < companyDistributionCount.length; k++) {
				output.push({
					value: values.filter((v) => v.id === parseInt(k, 10))[0].name,
					amount: companyDistributionCount[k],
				});
			}
		}

		return output.length > 0 ? output : null;
	}

	/**
	 * Get the total amount of employees of the filtered actors
	 */
	getTotalEmployees() {
		let total = 0;
		const acceptedIDs = this.state.filteredActors.map((a) => a.id);

		for (let i = 0; i < this.state.analytics.workforces.length; i++) {
			if (acceptedIDs.indexOf(this.state.analytics.workforces[i].company) >= 0) {
				total += this.state.analytics.workforces[i].workforce;
			}
		}

		return total;
	}

	render() {
		return (
			<div className={"page max-sized-page"}>
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>Recent activity</h1>
						<div className="top-right-buttons">
							<button
								disabled={Object.keys(this.state.filters).length === 0}
								onClick={() => this.setState({ filters: {} })}>
								Remove filters
							</button>
							<button
								onClick={() => this.getAnalytics()}>
								<i className="fas fa-redo-alt"/>
							</button>
						</div>
					</div>
					<div className="col-md-6">
						<h2>Recently added companies</h2>
						<div>
							{this.state.analytics !== null && "last_companies" in this.state.analytics
								? this.state.analytics.last_companies.map((o) => (
									<Company
										key={o.id}
										id={o.id}
										name={o.name}
										afterDeletion={() => this.getAnalytics()}
									/>
								))
								:								<Loading
									height={160}
								/>
							}
						</div>
					</div>
					<div className="col-md-6">
						<h2>Recently added users</h2>
						<div>
							{this.state.analytics !== null && "last_users" in this.state.analytics
								? this.state.analytics.last_users.map((o) => (
									<User
										key={o.id}
										id={o.id}
										email={o.email}
										afterDeletion={() => this.getAnalytics()}
									/>
								))
								:								<Loading
									height={160}
								/>
							}
						</div>
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>Global</h1>
					</div>
					<div className="col-md-4">
						<div className={"row"}>
							<div className="col-md-12">
								<h2>Total actors</h2>
								<div>
									{this.state.filteredActors !== null
										? <div className={"PageDashboard-analytic "
											+ (this.state.filteredActors.length === this.state.analytics.actors.length
												? "red-font" : "blue-font")}>
											<CountUp
												start={0}
												end={this.state.filteredActors.length}
												duration={1}
												delay={0}
											/>
										</div>
										:										<Loading
											height={70}
										/>
									}
								</div>
							</div>
							<div className="col-md-12">
								<h2>Core business</h2>
								<div>
									{this.state.filteredActors !== null
										? <div className={"PageDashboard-analytic "
											+ (this.state.filters.is_cybersecurity_core_business ? "red-font" : "blue-font")}>
											<CountUp
												start={0}
												end={this.state.filteredActors
													.filter((o) => o.is_cybersecurity_core_business).length}
												duration={1.6}
												delay={0}
											/>
										</div>
										:										<Loading
											height={70}
										/>
									}
								</div>
							</div>
							<div className="col-md-12">
								<h2>Startups</h2>
								<div>
									{this.state.filteredActors !== null
										? <div className={"PageDashboard-analytic "
											+ (this.state.filters.is_startup ? "red-font" : "blue-font")}>
											<CountUp
												start={0}
												end={this.state.filteredActors.filter((o) => o.is_startup).length}
												duration={1.6}
												delay={0}
											/>
										</div>
										:										<Loading
											height={70}
										/>
									}
								</div>
							</div>
						</div>
					</div>
					<div className="col-md-8">
						<div className={"row"}>
							<div className="col-md-12">
								{this.state.filteredActors !== null
									? <Bar
										data={{
											labels: ["Total actors", "Core business", "Startups"],
											datasets: [{
												label: [null, "is_cybersecurity_core_business", "is_startup"],
												data: [
													this.state.filteredActors.length,
													this.state.filteredActors
														.filter((o) => o.is_cybersecurity_core_business).length,
													this.state.filteredActors.filter((o) => o.is_startup).length,
												],
												backgroundColor: [
													this.state.filteredActors.length === this.state.analytics.actors.length ? "#fed7da" : "#bcebff",
													this.state.filters.is_cybersecurity_core_business ? "#fed7da" : "#bcebff",
													this.state.filters.is_startup ? "#fed7da" : "#bcebff",
												],
												borderColor: [
													this.state.filteredActors.length === this.state.analytics.actors.length ? "#e40613" : "#009fe3",
													this.state.filters.is_cybersecurity_core_business ? "#e40613" : "#009fe3",
													this.state.filters.is_startup ? "#e40613" : "#009fe3",
												],
												borderWidth: 1,
											}],
										}}
										options={{
											legend: {
												display: false,
											},
											scales: {
												yAxes: [
													{
														ticks: {
															beginAtZero: true,
														},
													},
												],
											},
											onClick: (mouseEvent, data) => {
												if (data.length > 0) {
													// eslint-disable-next-line no-underscore-dangle
													const l = data[0]._chart.config.data.datasets[0].label[data[0]._index];

													if (l === null) {
														this.manageFilter("is_cybersecurity_core_business", null, false);
														this.manageFilter("is_startup", null, false);
													} else if (!this.state.filters[l]) {
														this.manageFilter(l, true, true);
													} else {
														this.manageFilter(l, null, false);
													}
												}
											},
										}}
									/>
									:									<Loading
										height={300}
									/>
								}
							</div>
						</div>
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>Company profiles</h1>
					</div>
					<div className="col-md-6">
						<h2>Total employees</h2>
						<div>
							{this.state.filteredActors !== null
								? <div className={"PageDashboard-analytic blue-font"}>
									<i className="fas fa-user-tie"/><br/>
									<CountUp
										start={0}
										end={this.getTotalEmployees()}
										duration={1.6}
										delay={0}
									/>
								</div>
								:								<Loading
									height={70}
								/>
							}
						</div>
					</div>
					<div className="col-md-6">
						<h2>Employees per entity size ranges</h2>
						{this.state.filteredActors !== null
							? <BarWorkforceRange
								actors={this.state.filteredActors}
								workforces={this.state.analytics.workforces}
								addRangeFilter={(v) => this.manageFilter("size_range", v, "true")}
								selected={this.state.filters.size_range}
							/>
							:							<Loading
								height={300}
							/>
						}
					</div>
					<div className="col-md-6">
						<h2>Age of companies</h2>
						{this.state.filteredActors !== null
							? <BarActorAge
								actors={this.state.filteredActors}
								addRangeFilter={(v) => this.manageFilter("age_range", v, "true")}
								selected={this.state.filters.age_range}
							/>
							:							<Loading
								height={300}
							/>
						}
					</div>
					<div className="col-md-6">
						<h2>Companies per size ranges</h2>
						{this.state.filteredActors !== null
							? <BarWorkforceRange
								actors={this.state.filteredActors}
								workforces={this.state.analytics.workforces}
								companiesAsGranularity={true}
								addRangeFilter={(v) => this.manageFilter("size_range", v, "true")}
								selected={this.state.filters.size_range}
							/>
							:							<Loading
								height={300}
							/>
						}
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>Taxonomy</h1>
					</div>
					{this.state.filteredActors !== null
						? this.state.analytics.taxonomy_categories.map((category) => (
							<div
								className="col-md-12"
								key={category.name}
							>
								<h2>{category.name}</h2>
								{this.getTreeValues(category.name) !== null
									? <TreeMap
										data={{
											datasets: [{
												tree: this.getTreeValues(category.name),
												key: "amount",
												groups: ["value"],
												fontColor: "grey",
												borderColor: (ctx) => (
													ctx.dataset.data.length > 0
													&& this.state.filters.taxonomy_values
													&& this.state.filters.taxonomy_values
														.indexOf(ctx.dataset.data[ctx.dataIndex].g) >= 0
														? "#e40613" : "#8fddff"
												),
												backgroundColor: (ctx) => (
													ctx.dataset.data.length > 0
													&& this.state.filters.taxonomy_values
													&& this.state.filters.taxonomy_values
														.indexOf(ctx.dataset.data[ctx.dataIndex].g) >= 0
														? "#fed7da" : "#bcebff"
												),
												borderWidth: 1,
											}],
										}}
										options={{
											legend: {
												display: false,
											},
											tooltips: {
												callbacks: {
													title(item, data) {
														return data.datasets[item[0].datasetIndex].key;
													},
													label(item, data) {
														const dataset = data.datasets[item.datasetIndex];
														const dataItem = dataset.data[item.index];
														// eslint-disable-next-line no-underscore-dangle
														const obj = dataItem._data;
														const label = obj.value;
														return label + ": " + dataItem.v;
													},
												},
											},
											onClick: (mouseEvent, data) => {
												// eslint-disable-next-line no-underscore-dangle
												const dataset = data[0]._chart.config.data.datasets[data[0]._datasetIndex];
												// eslint-disable-next-line no-underscore-dangle
												const dataItem = dataset.data[data[0]._index];
												// eslint-disable-next-line no-underscore-dangle
												const obj = dataItem._data;
												const label = obj.value;

												if (this.state.filters.taxonomy_values
												&& this.state.filters.taxonomy_values.indexOf(label) >= 0) this.manageFilter("taxonomy_values", label, false);
												else this.manageFilter("taxonomy_values", label, true);
											},
										}}
									/>
									:								<Message
										height={180}
										text={"No data matched"}
									/>
								}
							</div>))
						:						<Loading
							height={300}
						/>
					}
				</div>

				<div className={"PageDashboard-filters"}>
					{this.state.analytics !== null
						? Object.keys(this.state.filters).map((axis) => (
							Object.keys(this.state.analytics).indexOf(axis) >= 0
								? this.state.filters[axis].map((value) => (
									<Filter
										key={axis + value}
										content={
											<div>{axis}: {value}</div>
										}
										onDelete={() => this.manageFilter(axis, value, false)}
									/>
								))
								:									<Filter
									content={axis + " : " + this.state.filters[axis]}
									onDelete={() => this.manageFilter(axis, null, false)}
								/>
						))
						: ""}
				</div>
			</div>
		);
	}
}
