import React from "react";
import "./DashboardGraph.css";
import Graph from "react-graph-vis";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../../utils/request.jsx";
import { dictToURI } from "../../utils/url.jsx";
import DialogGraphFilter from "../dialog/DialogGraphFilter.jsx";
import Loading from "../box/Loading.jsx";

export default class DashboardGraph extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			entityRelationships: null,
			entityRelationshipTypes: null,
			network: null,
			users: null,
			filters: null,
		};
	}

	componentDidMount() {
		if (this.state.network) {
			this.state.network.fit();
		}

		if (this.props.companies) {
			this.getEntityRelationship(this.props.companies.map((c) => c.id));
		}

		this.getEntityRelationshipTypes();
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.state.network && !prevState.network) {
			this.state.network.fit();
		}

		if (this.props.companies && !prevProps.companies) {
			this.getEntityRelationship(this.props.companies.map((c) => c.id));
		}
	}

	getUsers() {
		this.setState({ users: null }, () => {
			getRequest.call(this, "user/get_users", (data) => {
				this.setState({
					users: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	getEntityRelationship(entityIds) {
		const params = dictToURI({
			ids: entityIds,
		});

		this.setState({ entityRelationships: null }, () => {
			getRequest.call(this, "public/get_public_company_relationships?" + params, (data) => {
				this.setState({
					entityRelationships: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	getEntityRelationshipTypes() {
		this.setState({ entityRelationshipTypes: null }, () => {
			getRequest.call(this, "public/get_public_company_relationship_types", (data) => {
				this.setState({
					entityRelationshipTypes: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	getEntityRelationshipTypeById(id) {
		if (!this.state.entityRelationshipTypes) {
			return {};
		}

		const types = this.state.entityRelationshipTypes
			.filter((t) => t.id === id);

		if (types.length > 0) {
			return types[0];
		}

		return {};
	}

	getGraphData() {
		if (!this.props.analytics
			|| !this.props.companies
			|| !this.state.entityRelationships
			|| !this.state.entityRelationshipTypes) {
			return {
				nodes: [],
				edges: [],
			};
		}

		return {
			nodes: [
				...this.props.companies.map((c) => (
					{
						id: "ent-" + c.id,
						label: c.name,
						color: { border: "#8fddff", background: "#bcebff" },
						font: { color: "grey" },
						shape: "box",
					}
				)),
				...this.props.analytics.taxonomy_categories.map((c) => (
					{
						id: "cat-" + c.name,
						label: c.name,
						color: { border: "#fed7da", background: "#ffa8b0" },
						font: { color: "grey" },
						shape: "box",
					}
				)),
				...this.props.analytics.taxonomy_values.map((v) => (
					{
						id: "val-" + v.id,
						label: v.name,
						color: { border: "#ffa8b0", background: "#fed7da" },
						font: { color: "grey" },
						shape: "box",
					}
				)),
			],
			edges: [
				...this.state.entityRelationships
					? this.state.entityRelationships.map((r) => (
						{
							from: "ent-" + r.company_1,
							to: "ent-" + r.company_2,
							label: this.getEntityRelationshipTypeById(r.type).name,
							color: { color: "#bcebff" },
							font: { color: "#8fddff" },
							width: 2,
							arrows: {
								to: {
									enabled: this.getEntityRelationshipTypeById(r.type).is_directional === 1,
									scaleFactor: 1,
									type: "arrow",
								},
							},
							dashes: true,
						}
					))
					: [],
				...this.props.analytics
					? this.props.analytics.taxonomy_values.map((v) => (
						{
							from: "cat-" + v.category,
							to: "val-" + v.id,
							color: { color: "#fed7da" },
							width: 2,
							arrows: {
								to: {
									enabled: true,
									scaleFactor: 1,
									type: "arrow",
								},
							},
						}
					))
					: [],
				...this.props.analytics
					? this.props.analytics.taxonomy_assignments.map((a) => (
						{
							from: "ent-" + a.company,
							to: "val-" + a.taxonomy_value,
							color: { color: "lightgrey" },
							width: 1,
							arrows: {
								to: {
									enabled: true,
									scaleFactor: 1,
									type: "arrow",
								},
							},
						}
					))
					: [],
			],
		};
	}

	render() {
		if (!this.props.analytics
			|| !this.props.companies
			|| !this.state.entityRelationships
			|| !this.state.entityRelationshipTypes) {
			return <div id={"DashboardGraph"}>
				<Loading/>
			</div>;
		}

		const options = {
			physics: {
				enabled: true,
				maxVelocity: 10,
				solver: "forceAtlas2Based",
			},
			layout: {
			},
			nodes: {
				chosen: {
					node: (values) => {
						// eslint-disable-next-line no-param-reassign
						values.width = 4;
						// eslint-disable-next-line no-param-reassign
						values.borderSize = 4;
					},
				},
			},
			edges: {
				color: "lightgrey",
				font: {
					color: "lightgrey",
					size: 12,
					strokeWidth: 0,
				},
				smooth: {
					type: "discrete",
				},
				chosen: {
					edge: (values) => {
						// eslint-disable-next-line no-param-reassign
						values.width = 4;
					},
				},
			},
			height: "500px",
		};

		const events = {
			/* select: function(event) {
				var { nodes, edges } = event;
			} */
		};

		return (
			<div id={"DashboardGraph"} className="full-page">
				<div className={"row DashboardGraph-top-bar"}>
					<div className="col-md-9">
						<h1>Network graph</h1>
					</div>

					<div className="col-md-3">
						<div className={"top-right-buttons"}>
							<DialogGraphFilter
								trigger={
									<button
										className={"blue-background"}
										data-hover="Filter">
										<i className="fas fa-search"/>
									</button>
								}
								applyFilter={(filters) => this.changeState("filters", filters)}
							/>
						</div>
					</div>
				</div>

				<Graph
					graph={this.getGraphData()}
					options={options}
					events={events}
					getNetwork={(network) => this.setState({ network })}
				/>
			</div>
		);
	}
}
