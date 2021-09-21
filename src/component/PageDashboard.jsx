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
import Article from "./item/Article.jsx";
import BarActorAge from "./chart/BarActorAge.jsx";
import BarWorkforceRange from "./chart/BarWorkforceRange.jsx";
import TreeMap from "./chart/TreeMap.jsx";
import { getPastDate } from "../utils/date.jsx";

export default class PageDashboard extends React.Component {
	constructor(props) {
		super(props);

		this.getAnalytics = this.getAnalytics.bind(this);
		this.filterCompanies = this.filterCompanies.bind(this);
		this.getTreeValues = this.getTreeValues.bind(this);
		this.manageFilter = this.manageFilter.bind(this);
		this.getTotalEmployees = this.getTotalEmployees.bind(this);

		this.state = {
			analytics: null,
			companies: null,
			lastEvents: null,
			lastNews: null,
			filters: {},
			filteredCompanies: null,
		};
	}

	componentDidMount() {
		this.refresh();
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.filters !== this.state.filters
			|| prevState.analytics !== this.state.analytics
			|| prevState.companies !== this.state.companies) {
			this.filterCompanies();
		}
	}

	refresh() {
		this.getAnalytics();
		this.getCompanies();
		this.getLastNews();
		this.getLastEvents();
	}

	getAnalytics() {
		this.setState({ analytics: null }, () => {
			getRequest.call(this, "public/get_public_analytics", (data) => {
				this.setState({
					analytics: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	getCompanies() {
		this.setState({ companies: null }, () => {
			getRequest.call(this, "company/get_companies", (data) => {
				this.setState({
					companies: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	getLastNews() {
		this.setState({ lastNews: null }, () => {
			getRequest.call(this, "public/get_public_articles?type=NEWS&per_page=5", (data) => {
				this.setState({
					lastNews: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	getLastEvents() {
		this.setState({ lastEvents: null }, () => {
			getRequest.call(this, "public/get_public_articles?type=EVENT&per_page=5", (data) => {
				this.setState({
					lastEvents: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	/**
	 * Function to get the taxonomy category
	 */
	getCompanyTaxonomyCategory() {
		if (this.state.analytics) {
			let concernedValues = this.state.analytics.taxonomy_assignments.map((a) => a.taxonomy_value);
			concernedValues = [...new Set(concernedValues)];
			concernedValues = this.state.analytics.taxonomy_values
				.filter((v) => concernedValues.indexOf(v.id) >= 0);

			let concernedCategories = concernedValues.map((v) => v.category);
			concernedCategories = [...new Set(concernedCategories)];

			return concernedCategories;
		}

		return [];
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
	 * Filter the companies according to the selection defined in this.state.filters
	 * The result is set in this.state.filteredCompanies
	 */
	filterCompanies() {
		if (!this.state.analytics || !this.state.companies) return;

		let filteredCompanies = this.state.companies.map((o) => o);

		for (let key = 0; key < Object.keys(this.state.filters).length; key++) {
			const axis = Object.keys(this.state.filters)[key];

			if (axis === "taxonomy_values") {
				// Filter taxonomy values

				for (let i = 0; i < this.state.filters[axis].length; i++) {
					const tmpFilteredCompanies = [];

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

					filteredCompanies.forEach((filteredCompany) => {
						const companyValues = this.state.analytics.taxonomy_assignments
							.filter((a) => a.company === filteredCompany.id)
							.map((a) => a.taxonomy_value);

						if (acceptedValueIDs.filter((e) => companyValues.indexOf(e) >= 0).length > 0) {
							tmpFilteredCompanies.push(filteredCompany);
						}
					});

					filteredCompanies = tmpFilteredCompanies;
				}
			} else if (axis === "size_range") {
				// Filter the selected size range
				const tmpFilteredCompanies = [];

				filteredCompanies.forEach((filteredCompany) => {
					const workforces = this.state.analytics.workforces
						.filter((w) => w.company === filteredCompany.id);

					if (workforces.length > 0
						&& this.state.filters.size_range[0] <= workforces[0].workforce
						&& workforces[0].workforce <= this.state.filters.size_range[1]) {
						tmpFilteredCompanies.push(filteredCompany);
					}
				});

				filteredCompanies = tmpFilteredCompanies;
			} else if (axis === "age_range") {
				// Filter the selected age range

				const maxDate = getPastDate(this.state.filters.age_range[0]);
				const minDate = getPastDate(this.state.filters.age_range[1] + 1);

				filteredCompanies = filteredCompanies
					.filter((o) => minDate < o.creation_date && o.creation_date <= maxDate);
			} else {
				// Filter the selected company attribute such as is_cybersecurity_core_business, ...

				filteredCompanies = filteredCompanies
					.filter((o) => o[axis] === (this.state.filters[axis] ? 1 : 0));
			}
		}

		this.setState({
			filteredCompanies,
		});
	}

	/**
	 * Get the values to feed the tree charts
	 * @param {category} Name of the taxonomy category of the tree chart
	 */
	getTreeValues(category) {
		if (!this.state.analytics || !this.state.filteredCompanies) return [];

		const output = [];
		const dictOutput = {};

		const parentCategories = this.state.analytics.taxonomy_category_hierarchy
			.map((h) => h.parent_category);

		if (parentCategories.indexOf(category) < 0) {
			const companyIDs = this.state.filteredCompanies.map((o) => o.id);
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
			const companyIDs = this.state.filteredCompanies.map((o) => o.id);

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
	 * Get the total amount of employees of the filtered companies
	 */
	getTotalEmployees() {
		let total = 0;
		const acceptedIDs = this.state.filteredCompanies.map((a) => a.id);

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

					<div className="col-md-12">
						<h2>Recently added entities</h2>

						<div>
							{this.state.companies
								? this.state.companies
									.slice(Math.max(this.state.companies.length - 5, 0))
									.reverse()
									.map((o) => (
										<Company
											key={o.id}
											id={o.id}
											name={o.name}
										/>
									))
								: <Loading
									height={160}
								/>
							}
						</div>
					</div>

					<div className="col-md-6">
						<h2>Last public news</h2>

						<div>
							{this.state.analytics && this.state.lastNews
								? this.state.lastNews.items.map((o) => (
									<Article
										key={o.id}
										id={o.id}
										name={o.title}
										afterDeletion={() => this.refresh()}
									/>
								))
								: <Loading
									height={160}
								/>
							}
						</div>
					</div>

					<div className="col-md-6">
						<h2>Last public events</h2>

						<div>
							{this.state.analytics && this.state.lastEvents
								? this.state.lastEvents.items.map((o) => (
									<Article
										key={o.id}
										id={o.id}
										name={o.title}
										afterDeletion={() => this.refresh()}
									/>
								))
								: <Loading
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
								<h2>Total entities</h2>
								<div>
									{this.state.filteredCompanies
										&& this.state.companies
										? <div className={"PageDashboard-analytic "
											+ (this.state.filteredCompanies.length === this.state.companies.length
												? "red-font" : "blue-font")}>
											<CountUp
												start={0}
												end={this.state.filteredCompanies.length}
												duration={1}
												delay={0}
											/>
										</div>
										: <Loading
											height={70}
										/>
									}
								</div>
							</div>

							<div className="col-md-12">
								<h2>Startups</h2>
								<div>
									{this.state.filteredCompanies
										? <div className={"PageDashboard-analytic "
											+ (this.state.filters.is_startup ? "red-font" : "blue-font")}>
											<CountUp
												start={0}
												end={this.state.filteredCompanies.filter((o) => o.is_startup).length}
												duration={1.6}
												delay={0}
											/>
										</div>
										: <Loading
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
								{this.state.filteredCompanies && this.state.filteredCompanies
									? <Bar
										data={{
											labels: ["Total entities", "Startups"],
											datasets: [{
												label: [null, "is_startup"],
												data: [
													this.state.filteredCompanies.length,
													this.state.filteredCompanies.filter((o) => o.is_startup).length,
												],
												backgroundColor: [
													this.state.filteredCompanies.length === this.state.companies.length
														? "#fed7da" : "#bcebff",
													this.state.filters.is_startup ? "#fed7da" : "#bcebff",
												],
												borderColor: [
													this.state.filteredCompanies.length === this.state.companies.length
														? "#e40613" : "#009fe3",
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
									: <Loading
										height={300}
									/>
								}
							</div>
						</div>
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>Entity profiles</h1>
					</div>

					<div className="col-md-6">
						<h2>Total employees</h2>
						<div>
							{this.state.analytics && this.state.filteredCompanies
								? <div className={"PageDashboard-analytic blue-font"}>
									<i className="fas fa-user-tie"/><br/>
									<CountUp
										start={0}
										end={this.getTotalEmployees()}
										duration={1.6}
										delay={0}
									/>
								</div>
								: <Loading
									height={70}
								/>
							}
						</div>
					</div>

					<div className="col-md-6">
						<h2>Employees per entity size ranges</h2>
						{this.state.analytics && this.state.filteredCompanies
							? <BarWorkforceRange
								actors={this.state.filteredCompanies}
								workforces={this.state.analytics.workforces}
								addRangeFilter={(v) => this.manageFilter("size_range", v, "true")}
								selected={this.state.filters.size_range}
							/>
							: <Loading
								height={300}
							/>
						}
					</div>

					<div className="col-md-6">
						<h2>Age of entities</h2>
						{this.state.filteredCompanies
							? <BarActorAge
								actors={this.state.filteredCompanies}
								addRangeFilter={(v) => this.manageFilter("age_range", v, "true")}
								selected={this.state.filters.age_range}
							/>
							: <Loading
								height={300}
							/>
						}
					</div>

					<div className="col-md-6">
						<h2>Entities per size ranges</h2>
						{this.state.analytics && this.state.filteredCompanies
							? <BarWorkforceRange
								actors={this.state.filteredCompanies}
								workforces={this.state.analytics.workforces}
								companiesAsGranularity={true}
								addRangeFilter={(v) => this.manageFilter("size_range", v, "true")}
								selected={this.state.filters.size_range}
							/>
							: <Loading
								height={300}
							/>
						}
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>Taxonomy</h1>
					</div>

					{this.state.filteredCompanies !== null
						? this.getCompanyTaxonomyCategory()
							.map((category) => (
								<div
									className="col-md-12"
									key={category}
								>
									<h2>{category}</h2>

									{this.getTreeValues(category) !== null
										? <TreeMap
											data={{
												datasets: [{
													tree: this.getTreeValues(category),
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
													const dataset = data[0]._chart.config.data
													// eslint-disable-next-line no-underscore-dangle
														.datasets[data[0]._datasetIndex];
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
										: <Message
											height={180}
											text={"No data matched"}
										/>
									}
								</div>))
						: <Loading
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
