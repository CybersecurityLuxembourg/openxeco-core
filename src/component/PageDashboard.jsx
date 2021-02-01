import React from 'react';
import './PageDashboard.css';
import {NotificationManager as nm} from 'react-notifications';
import {getRequest} from '../utils/request';
import Loading from "./box/Loading";
import Filter from "./box/Filter";
import Message from "./box/Message";
import Company from "./item/Company";
import User from "./item/User";
import CountUp from 'react-countup';
import {Bar} from 'react-chartjs-2';
import BarActorAge from "./chart/BarActorAge";
import BarWorkforceRange from "./chart/BarWorkforceRange";
import TreeMap from "./chart/TreeMap";
import {getPastDate} from "../utils/date";


export default class PageDashboard extends React.Component {

	constructor(props){
		super(props);

		this.getAnalytics = this.getAnalytics.bind(this);
		this.filterActors = this.filterActors.bind(this);
		this.getTreeValues = this.getTreeValues.bind(this);
		this.manageFilter = this.manageFilter.bind(this);
		this.getTotalEmployees = this.getTotalEmployees.bind(this);

		this.state = {
			analytics: null,
			filters: {},
			filtered_actors: null,
		}
	}

	componentDidMount(){
		this.getAnalytics();
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		if (prevState.filters !== this.state.filters ||
			prevState.analytics !== this.state.analytics) {
			this.filterActors();
		}
	}

	getAnalytics() {
		getRequest.call(this, "analytic/get_global_analytics", data => {
            this.setState({
                analytics: data,
            });
        }, response => {
            nm.warning(response.statusText);
        }, error => {
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
						let filters = JSON.parse(JSON.stringify(this.state.filters));
						filters[axis].push(value);
						this.setState({ filters: filters });
					}
				} else {
					let filters = JSON.parse(JSON.stringify(this.state.filters));
					filters[axis] = [value];
					this.setState({ filters: filters });
				}
			} else {
				if (Object.keys(this.state.filters).indexOf(axis) >= 0) {
					if (this.state.filters[axis].indexOf(value) >= 0) {
						let filters = JSON.parse(JSON.stringify(this.state.filters));
						filters[axis] = filters[axis].filter(o => o !== value);
						this.setState({ filters: filters });
					}
				}
			}
		} else {
			if (add) {
				let filters = JSON.parse(JSON.stringify(this.state.filters));
				filters[axis] = value
				this.setState({ filters: filters });
			} else {
				let filters = JSON.parse(JSON.stringify(this.state.filters));
				delete filters[axis];
				this.setState({ filters: filters });
			}
		}
	}

	/**
	 * Filter the actors according to the selection defined in this.state.filters
	 * The result is set in this.state.filtered_actors
	 */
	filterActors() {
		if (this.state.analytics === null)
			return;

		let filtered_actors = this.state.analytics.actors.map(o => { return o })

		for (let key in Object.keys(this.state.filters)) {
			let axis = Object.keys(this.state.filters)[key];

			if (axis === "taxonomy_values") {
				// Filter taxonomy values

				for (let i in this.state.filters[axis]) {
					let tmp_filtered_actors = [];

					let valueName = this.state.filters[axis][i];
					let value = this.state.analytics.taxonomy_values
						.filter(v => v.name === valueName)[0]
					
					// Get the child values to accept

					let values = [value];
					let childReached = false;

					while (!childReached) {
						let parentValues = values.map(v => { return v.id })
						let childValues = this.state.analytics.taxonomy_value_hierarchy
							.filter(h => parentValues.indexOf(h.parent_value) >= 0)
							.map(h => { return h.child_value });

						if (childValues.length > 0) {
							values = this.state.analytics.taxonomy_values
								.filter(v => childValues.indexOf(v.id) >= 0)
						} else {
							childReached = true;
						}
					}

					// Filter the companies according to the assignment

					let acceptedValueIDs = values.map(v => { return v.id });

					for (let i in filtered_actors) {
						let companyValues = this.state.analytics.taxonomy_assignments
							.filter(a => a.company === filtered_actors[i].id)
							.map(a => { return a.taxonomy_value });

						if (acceptedValueIDs.filter(e => companyValues.indexOf(e) >= 0).length > 0)
							tmp_filtered_actors.push(filtered_actors[i]);
					}

					filtered_actors = tmp_filtered_actors;
				}
			} else if (axis === "size_range") {
				// Filter the selected size range
				let tmp_filtered_actors = [];

				for (let k in filtered_actors) {
					let workforces = this.state.analytics.workforces
						.filter(w => w.company === filtered_actors[k].id);

					if (workforces.length > 0 && 
						this.state.filters.size_range[0] <= workforces[0].workforce &&
						workforces[0].workforce <= this.state.filters.size_range[1])
						tmp_filtered_actors.push(filtered_actors[k])
				}

				filtered_actors = tmp_filtered_actors;
			} else if (axis === "age_range") {
				// Filter the selected age range

				let max_date = getPastDate(this.state.filters.age_range[0]);
				let min_date = getPastDate(this.state.filters.age_range[1] + 1);

				filtered_actors = filtered_actors.filter(o => min_date < o.creation_date && o.creation_date <= max_date);
			} else {
				// Filter the selected company attribute such as is_cybersecurity_core_business, ...

				filtered_actors = filtered_actors.filter(o => o[axis] === (this.state.filters[axis] ? 1 : 0));
			}
		}

		this.setState({
			filtered_actors: filtered_actors
		});
	}

	/**
	 * Get the values to feed the tree charts
	 * @param {category} Name of the taxonomy category of the tree chart
	 */
	getTreeValues(category) {
		if (this.state.analytics === null || this.state.filtered_actors === null)
			return []

		let output = [];
		let dictOutput = {};

		let parent_categories = this.state.analytics.taxonomy_category_hierarchy
			.map(h => { return h.parent_category })

		if (parent_categories.indexOf(category) < 0) {
			let companyIDs = this.state.filtered_actors.map(o => { return o.id });
			let values = this.state.analytics.taxonomy_values
				.filter(v => v.category === category);
			let valueIDs = values.map(v => { return v.id });
			let assignments = this.state.analytics.taxonomy_assignments
				.filter(a => valueIDs.indexOf(a.taxonomy_value) >= 0)
				.filter(a => companyIDs.indexOf(a.company) >= 0);

			for (let i in assignments) {
				if (assignments[i].taxonomy_value in dictOutput) {
					dictOutput[assignments[i].taxonomy_value] += 1;
				} else {
					dictOutput[assignments[i].taxonomy_value] = 1;
				}
			}

			for (let key in dictOutput) {
				output.push({
					value: values.filter(v => v.id === parseInt(key))[0].name,
					amount: dictOutput[key]
				});
			}
		} else {
			//
			//	This section if the asked category is not a child one
			//

			let values = this.state.analytics.taxonomy_values
				.filter(v => v.category === category);
			let valueIDs = values.map(v => { return v.id });

			let childReached = false;
			let currentCategory = category;
			let currentCategoryValues = null;

			// Build the dict with the children values of category

			for (let i in values) {
				dictOutput[values[i].id] = [values[i].id];
			}

			while (!childReached) {
				let childCategories = this.state.analytics.taxonomy_category_hierarchy
					.filter(h => h.parent_category == currentCategory)

				if (childCategories.length > 0) {
					currentCategory = childCategories[0].child_category;
					currentCategoryValues = this.state.analytics.taxonomy_values
						.filter(v => v.category === currentCategory)

					for (let key in dictOutput) {
						dictOutput[key] = this.state.analytics.taxonomy_value_hierarchy
							.filter(h => dictOutput[key].indexOf(h.parent_value) >= 0)
							.map(h => { return h.child_value });
					}
				} else {
					childReached = true;
				}
			}

			// Build the distribution per company

			let companyDistribution = {};
			let companyIDs = this.state.filtered_actors.map(o => { return o.id });

			for (let i in companyIDs) {
				companyDistribution[companyIDs[i]] = []
				let companyAssignments = this.state.analytics.taxonomy_assignments
					.filter(a => a.company === companyIDs[i])

				for (let y in companyAssignments) {
					for (let k in dictOutput) {
						if (dictOutput[k].indexOf(companyAssignments[y].taxonomy_value) >= 0
							&& companyDistribution[companyAssignments[y].company].indexOf(k) < 0)
							companyDistribution[companyAssignments[y].company].push(k);
					}
				}
			}

			// Do the final count

			let companyDistributionCount = {}

			for (let i in values) {
				companyDistributionCount[values[i].id] = 0;
			}

			for (let k in companyDistribution) {
				for (let i in companyDistribution[k]) {
					companyDistributionCount[companyDistribution[k][i]] += 1;
				}
			}

			for (let k in companyDistributionCount) {
				output.push({
					value: values.filter(v => v.id === parseInt(k))[0].name,
					amount: companyDistributionCount[k]
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
		let acceptedIDs = this.state.filtered_actors.map(a => { return a.id });

		for (let i in this.state.analytics.workforces) {
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
							{this.state.analytics !== null && "last_companies" in this.state.analytics ?
								this.state.analytics.last_companies.map(o => {
									return (
										<Company
											id={o.id}
											name={o.name}
											afterDeletion={() => this.getAnalytics()}
										/>
									);
								})
								:
								<Loading
									height={160}
								/>
							}
						</div>
					</div>
					<div className="col-md-6">
						<h2>Recently added users</h2>
						<div>
							{this.state.analytics !== null && "last_users" in this.state.analytics ?
								this.state.analytics.last_users.map(o => {
									return (
										<User
											id={o.id}
											email={o.email}
											afterDeletion={() => this.getAnalytics()}
										/>
									);
								})
								:
								<Loading
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
									{this.state.filtered_actors !== null ?
										<div className={"PageDashboard-analytic " + 
											(this.state.filtered_actors.length === this.state.analytics.actors.length ? 
												"red-font" : "blue-font")}>
											<CountUp
											 	start={0}
												end={this.state.filtered_actors.length}
												duration={1}
												delay={0}
											/>
										</div>
										:
										<Loading
											height={70}
										/>
									}
								</div>
							</div>
							<div className="col-md-12">
								<h2>Core business</h2>
								<div>
									{this.state.filtered_actors !== null ?
										<div className={"PageDashboard-analytic " + 
											(this.state.filters.is_cybersecurity_core_business ? "red-font" : "blue-font")}>
											<CountUp
											 	start={0}
												end={this.state.filtered_actors
													.filter(o => o.is_cybersecurity_core_business).length}
												duration={1.6}
												delay={0}
											/>
										</div>
										:
										<Loading
											height={70}
										/>
									}
								</div>
							</div>
							<div className="col-md-12">
								<h2>Startups</h2>
								<div>
									{this.state.filtered_actors !== null ?
										<div className={"PageDashboard-analytic " + 
											(this.state.filters.is_startup ? "red-font" : "blue-font")}>
											<CountUp
											 	start={0}
												end={this.state.filtered_actors.filter(o => o.is_startup).length}
												duration={1.6}
												delay={0}
											/>
										</div>
										:
										<Loading
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
								{this.state.filtered_actors !== null ?
									<Bar 
										data={{
										  labels: ["Total actors", "Core business", "Startups"],
										  datasets: [{
										      label: [null, "is_cybersecurity_core_business", "is_startup"],
										      data: [this.state.filtered_actors.length,
										      	this.state.filtered_actors.filter(o => o.is_cybersecurity_core_business).length,
										      	this.state.filtered_actors.filter(o => o.is_startup).length],
										      backgroundColor: [
										      	this.state.filtered_actors.length === this.state.analytics.actors.length ? '#fed7da' : '#bcebff', 
										      	this.state.filters.is_cybersecurity_core_business ? '#fed7da' : '#bcebff', 
										      	this.state.filters.is_startup ? '#fed7da' : '#bcebff'],
										      borderColor: [
										      	this.state.filtered_actors.length === this.state.analytics.actors.length ? '#e40613' : '#009fe3', 
										      	this.state.filters.is_cybersecurity_core_business ? '#e40613' : '#009fe3', 
										      	this.state.filters.is_startup ? '#e40613' : '#009fe3'],
										      borderWidth: 1,
										  }],
										}} 
										options={{
											legend: {
										        display: false
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
											    	var label = data[0]._chart.config.data.datasets[0].label[data[0]._index];

											    	if (label === null) {
											    		this.manageFilter("is_cybersecurity_core_business", null, false);
											    		this.manageFilter("is_startup", null, false);
											    	} else {
											    		if (!this.state.filters[label])
											    			this.manageFilter(label, true, true);
											    		else
											    			this.manageFilter(label, null, false);
											    	}
												}
										    }
										}}
									/>
									:
									<Loading
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
							{this.state.filtered_actors !== null ?
								<div className={"PageDashboard-analytic blue-font"}>
									<i className="fas fa-user-tie"/><br/>
									<CountUp
									 	start={0}
										end={this.getTotalEmployees()}
										duration={1.6}
										delay={0}
									/>
								</div>
								:
								<Loading
									height={70}
								/>
							}
						</div>
					</div>
					<div className="col-md-6">
						<h2>Employees per company size ranges</h2>
						{this.state.filtered_actors !== null ?
							<BarWorkforceRange
								actors={this.state.filtered_actors}
								workforces={this.state.analytics.workforces}
								addRangeFilter={(v) => this.manageFilter("size_range", v, "true")}
								selected={this.state.filters.size_range}
							/>
							:
							<Loading
								height={300}
							/>
						}
					</div>
					<div className="col-md-6">
						<h2>Age of companies</h2>
						{this.state.filtered_actors !== null ?
							<BarActorAge
								actors={this.state.filtered_actors}
								addRangeFilter={(v) => this.manageFilter("age_range", v, "true")}
								selected={this.state.filters.age_range}
							/>
							:
							<Loading
								height={300}
							/>
						}
					</div>
					<div className="col-md-6">
						<h2>Companies per size ranges</h2>
						{this.state.filtered_actors !== null ?
							<BarWorkforceRange
								actors={this.state.filtered_actors}
								workforces={this.state.analytics.workforces}
								companiesAsGranularity={true}
								addRangeFilter={(v) => this.manageFilter("size_range", v, "true")}
								selected={this.state.filters.size_range}
							/>
							:
							<Loading
								height={300}
							/>
						}
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>Taxonomy</h1>
					</div>
					{this.state.filtered_actors !== null ?
						this.state.analytics.taxonomy_categories.map(category => { return (
						<div className="col-md-12">
							<h2>{category.name}</h2>
							{this.getTreeValues(category.name) !== null ?
								<TreeMap 
									data={{
										datasets: [{
											tree: this.getTreeValues(category.name),
											key: 'amount',
											groups: ['value'],
											fontColor: "grey",
									        borderColor: (ctx) => {
									        	return (
									        		ctx.dataset.data.length > 0 &&
									        		this.state.filters["taxonomy_values"] &&
									        		this.state.filters["taxonomy_values"]
									        			.indexOf(ctx.dataset.data[ctx.dataIndex].g) >= 0 ?
									        		'#e40613' : "#8fddff"
									        	)
									        },
									        backgroundColor: (ctx) => {
									        	return (
									        		ctx.dataset.data.length > 0 &&
									        		this.state.filters["taxonomy_values"] &&
									        		this.state.filters["taxonomy_values"]
									        			.indexOf(ctx.dataset.data[ctx.dataIndex].g) >= 0 ?
									        		'#fed7da' : "#bcebff" 
									        	)
									        },
									        borderWidth: 1,
										}]
									}}
									options={{
									    legend: {
									      display: false
									    },
									    tooltips: {
									      callbacks: {
									        title: function(item, data) {
									          return data.datasets[item[0].datasetIndex].key;
									        },
									        label: function(item, data) {
									          var dataset = data.datasets[item.datasetIndex];
									          var dataItem = dataset.data[item.index];
									          var obj = dataItem._data;
									          var label = obj.value;
									          return label + ': ' + dataItem.v;
									        }
									      }  
									    },
									    onClick: (mouseEvent, data) => {
									    	var dataset = data[0]._chart.config.data.datasets[data[0]._datasetIndex];
									        var dataItem = dataset.data[data[0]._index];
									        var obj = dataItem._data;
									        var label = obj.value;

									        if (this.state.filters["taxonomy_values"] &&
									        	this.state.filters["taxonomy_values"].indexOf(label) >= 0)
									        	this.manageFilter("taxonomy_values", label, false)
									        else
									        	this.manageFilter("taxonomy_values", label, true)
									    }
									}}
								/>
							:
								<Message 
									height={180}
									text={"No data matched"}
								/>
							}
						</div>)})
						:
						<Loading
							height={300}
						/>
					}
				</div>

				<div className={"PageDashboard-filters"}>
					{this.state.analytics !== null ?
						Object.keys(this.state.filters).map(axis => {
							return (
								Object.keys(this.state.analytics).indexOf(axis) >= 0 ?
									this.state.filters[axis].map(value => {
										return (
											<Filter
												content={
													<div>{axis}: {value}</div>
												}
												onDelete={() => this.manageFilter(axis, value, false)}
											/>
										)
									})
								:
									<Filter
										content={axis + " : " + this.state.filters[axis]}
										onDelete={() => this.manageFilter(axis, null, false)}
									/>
							)
						})
					: ""}
				</div>
			</div>
		);
	}
}