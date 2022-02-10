import React from "react";
import "./CompanyTaxonomy.css";
import { NotificationManager as nm } from "react-notifications";
import Tree from "react-d3-tree";
import { getRequest, postRequest } from "../../../utils/request.jsx";
import Loading from "../../box/Loading.jsx";
import Message from "../../box/Message.jsx";

export default class CompanyTaxonomy extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.saveAssignmentChange = this.saveAssignmentChange.bind(this);
		this.getChildCategories = this.getChildCategories.bind(this);
		this.getTreeData = this.getTreeData.bind(this);
		this.fillChildrenRecursively = this.fillChildrenRecursively.bind(this);
		this.getLevelsOfCategory = this.getLevelsOfCategory.bind(this);
		this.onNodeClick = this.onNodeClick.bind(this);

		this.state = {
			companyAssignment: null,
			categories: null,
			categoryHierarchy: null,
			values: null,
			valueHierarchy: null,
		};
	}

	componentDidMount() {
		this.refresh();
	}

	refresh() {
		getRequest.call(this, "company/get_company_taxonomy/" + this.props.id, (data) => {
			this.setState({
				companyAssignment: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "taxonomy/get_taxonomy_categories", (data) => {
			this.setState({
				categories: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "taxonomy/get_taxonomy_category_hierarchy", (data) => {
			this.setState({
				categoryHierarchy: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "taxonomy/get_taxonomy_values", (data) => {
			this.setState({
				values: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "taxonomy/get_taxonomy_value_hierarchy", (data) => {
			this.setState({
				valueHierarchy: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	saveAssignmentChange(prop, value, status) {
		const params = {
			id: this.props.id,
			property: prop,
			value,
			status,
		};

		postRequest.call(this, "taxonomy/add_taxonomy_assignment", params, () => {
			const companyProfile = { ...this.state.companyProfile };

			if (status) companyProfile[prop].push(value);
			else companyProfile[prop].splice(companyProfile[prop].indexOf(value), 1);

			this.setState({ companyProfile });
			nm.info("The property has been updated");
		}, (response) => {
			this.refreshCompanyData();
			nm.warning(response.statusText);
		}, (error) => {
			this.refreshCompanyData();
			nm.error(error.message);
		});
	}

	getChildCategories() {
		return this.state.categories
			.filter((c) => this.state.categoryHierarchy
				.map((ch) => ch.parent_category).indexOf(c.name) < 0);
	}

	getTreeData(category) {
		const treeData = {
			name: "",
		};

		// Get levels of tree

		const levels = this.getLevelsOfCategory(category);

		// Build data structure

		treeData.children = this.fillChildrenRecursively(null, -1, levels);

		return [treeData];
	}

	fillChildrenRecursively(parent, parentLevel, levels) {
		if (parentLevel + 1 >= levels.length) return undefined;

		const childCategory = levels[parentLevel + 1];
		let childValues = this.state.values.filter((v) => v.category === childCategory);

		if (parent !== null) {
			childValues = childValues.filter((v) => this.state.valueHierarchy
				.filter((hv) => hv.parent_value === parent)
				.map((hv) => hv.child_value).indexOf(v.id) >= 0);
		}

		const children = [];

		for (let i = 0; i < childValues.length; i++) {
			const child = {
				child_id: childValues[i].id,
				name: childValues[i].name,
				children: this.fillChildrenRecursively(childValues[i].id, parentLevel + 1, levels),
				leafLevel: levels.length,
			};

			if (parentLevel + 2 === levels.length) {
				let fillColor = null;

				if (this.state.companyAssignment === null) {
					fillColor = "lightgrey";
				} else if (this.state.companyAssignment
					.filter((a) => a.taxonomy_value === childValues[i].id).length > 0) {
					fillColor = "#bcebff";
				} else {
					fillColor = "#fed7da";
				}

				child.nodeSvgShape = {
					shape: "circle",
					shapeProps: {
						r: 10,
						fill: fillColor,
					},
				};
			}

			children.push(child);
		}

		return children;
	}

	getLevelsOfCategory(category) {
		let levels = [category];

		while (this.state.categoryHierarchy.map((ch) => ch.child_category).indexOf(levels[0]) >= 0) {
			// eslint-disable-next-line no-loop-func
			const link = this.state.categoryHierarchy.filter((ch) => ch.child_category === levels[0])[0];
			levels = [link.parent_category].concat(levels);
		}

		return levels;
	}

	onNodeClick(info) {
		if (info.depth === info.leafLevel) {
			const childId = info.child_id;

			const matchingCompanyAssignment = this.state.companyAssignment
				.filter((vh) => vh.company === this.props.id && vh.taxonomy_value === childId);

			const params = {
				company: this.props.id,
				value: childId,
			};

			if (matchingCompanyAssignment.length === 0) {
				postRequest.call(this, "taxonomy/add_taxonomy_assignment", params, () => {
					getRequest.call(this, "company/get_company_taxonomy/" + this.props.id, (data) => {
						this.setState({
							companyAssignment: data,
						});
					}, (response) => {
						nm.warning(response.statusText);
					}, (error) => {
						nm.error(error.message);
					});
					nm.info("The taxonomy has been updated");
				}, (response) => {
					nm.warning(response.statusText);
				}, (error) => {
					nm.error(error.message);
				});
			} else {
				postRequest.call(this, "taxonomy/delete_taxonomy_assignment", params, () => {
					getRequest.call(this, "company/get_company_taxonomy/" + this.props.id, (data) => {
						this.setState({
							companyAssignment: data,
						});
					}, (response) => {
						nm.warning(response.statusText);
					}, (error) => {
						nm.error(error.message);
					});
					nm.info("The taxonomy has been updated");
				}, (response) => {
					nm.warning(response.statusText);
				}, (error) => {
					nm.error(error.message);
				});
			}
		}
	}

	render() {
		if (this.state.companyTaxonomy === null
            || this.state.categories === null
            || this.state.categoryHierarchy === null
            || this.state.values === null
            || this.state.valueHierarchy === null) {
			return (
				<Loading
					height={300}
				/>
			);
		}

		return (
			<div className={"row"}>
				<div className="col-md-12">
					<h2>Taxonomy</h2>
				</div>
				<div className="col-md-12">
					{this.getChildCategories()
						.filter((c) => c.active_on_companies).length === 0
						&& <div className={"row row-spaced"}>
							<div className="col-md-12">
								<Message
									height={200}
									text={"No taxonomy found for the entities"}
								/>
							</div>
						</div>
					}

					{this.getChildCategories()
						.filter((c) => c.active_on_companies)
						.map((c) => (
							<div className={"row row-spaced"} key={c.name}>
								<div
									className="col-md-12"
									style={{ height: 200 + 200 * this.getLevelsOfCategory(c.name).length }}>
									<h3>{c.name}</h3>
									<Tree
										data={this.getTreeData(c.name)}
										zoom={0.7}
										enableLegacyTransition={true}
										transitionDuration={0}
										translate={{
											x: 100,
											y: (200 + 200 * this.getLevelsOfCategory(c.name).length) / 2,
										}}
										separation={{
											siblings: 0.17,
											nonSiblings: 0.3,
										}}
										nodeSize={{
											y: 140,
											x: 300,
										}}
										textLayout={{
											x: 20,
											y: 0,
											transform: "string",
										}}
										styles={{
											links: {
												stroke: "lightgrey",
												strokeWidth: 2,
											},
											nodes: {
												node: {
													circle: {
														stroke: "lightgrey",
														fill: "lightgrey",
													},
													name: {
														stroke: "gray",
													},
													attributes: {},
												},
												leafNode: {
													circle: {
														stroke: "lightgrey",
														fill: "lightgrey",
													},
													name: {
														stroke: "gray",
													},
													attributes: {},
												},
											},
										}}
										onClick={(i, e) => this.onNodeClick(i, e)}
									/>
								</div>
							</div>
						))
					}
				</div>
			</div>
		);
	}
}
