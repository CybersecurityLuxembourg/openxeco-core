import React from "react";
import "./DashboardGraph.css";
import Graph from "react-graph-vis";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../../utils/request.jsx";
import { dictToURI } from "../../utils/url.jsx";
import DialogGraphFilter from "./dashboardgraph/DialogGraphFilter.jsx";
import DialogDataLoader from "./dashboardgraph/DialogDataLoader.jsx";
import Loading from "../box/Loading.jsx";

export default class DashboardGraph extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			entityRelationships: null,
			entityRelationshipTypes: null,
			users: [],
			userGroups: null,
			userGroupAssignments: null,
			userEntityAssignments: null,
			articleEnums: null,

			filters: {
				hideTaxonomyCategories: true,
				hideTaxonomyValues: true,
			},

			network: null,
			shape: "icon",
		};
	}

	componentDidMount() {
		if (this.state.network) {
			this.state.network.moveTo({
				scale: 0.2,
			});
		}

		if (this.props.entities) {
			this.getEntityRelationship(this.props.entities.map((c) => c.id));
		}

		this.getEntityRelationshipTypes();
		this.getArticleEnums();
		this.getUsers();
		this.getUserGroups();
		this.getUserGroupAssignments();
		this.getUserEntityAssignments();
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.state.network && !prevState.network) {
			this.state.network.moveTo({
				scale: 0.2,
			});
		}

		if (this.props.entities && !prevProps.entities) {
			this.getEntityRelationship(this.props.entities.map((c) => c.id));
		}

		if (this.state.articleEnums && !prevState.articleEnums) {
			for (let i = 0; i < this.state.articleEnums.type.length; i++) {
				this.getArticles(this.state.articleEnums.type[i], 1);
			}
		}
	}

	getUsers(page) {
		const params = dictToURI({
			page: page || 1,
		});

		getRequest.call(this, "user/get_users?" + params, (data) => {
			const currentUsers = this.state.users;

			if (!currentUsers) {
				this.setState({ users: [data] });
			} else {
				currentUsers.push(data);
				this.setState({ users: currentUsers });
			}
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getUserGroups() {
		this.setState({ userGroups: null }, () => {
			getRequest.call(this, "user/get_user_groups", (data) => {
				this.setState({
					userGroups: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	getUserGroupAssignments() {
		this.setState({ userGroupAssignments: null }, () => {
			getRequest.call(this, "user/get_user_group_assignments", (data) => {
				this.setState({
					userGroupAssignments: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	getUserEntityAssignments() {
		this.setState({ userEntityAssignments: null }, () => {
			getRequest.call(this, "user/get_user_entity_assignments", (data) => {
				this.setState({
					userEntityAssignments: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	getArticleEnums() {
		this.setState({ articleEnums: null }, () => {
			getRequest.call(this, "public/get_public_article_enums", (data) => {
				this.setState({
					articleEnums: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	getArticles(type, page) {
		const params = dictToURI({
			type,
			page: page || 1,
			include_tags: true,
		});

		getRequest.call(this, "public/get_public_articles?" + params, (data) => {
			const currentArticles = this.state[type];

			if (!currentArticles) {
				this.setState({ [type]: [data] });
			} else {
				currentArticles.push(data);
				this.setState({ [type]: currentArticles });
			}
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getEntityRelationship(entityIds) {
		const params = dictToURI({
			ids: entityIds,
		});

		this.setState({ entityRelationships: null }, () => {
			getRequest.call(this, "public/get_public_entity_relationships?" + params, (data) => {
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
			getRequest.call(this, "public/get_public_entity_relationship_types", (data) => {
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

	getArticlesToShow() {
		if (!this.state.articleEnums) {
			return [];
		}

		let articles = [];

		for (let i = 0; i < this.state.articleEnums.type.length; i++) {
			if (this.state[this.state.articleEnums.type[i]]) {
				for (let y = 0; y < this.state[this.state.articleEnums.type[i]].length; y++) {
					articles = articles.concat(this.state[this.state.articleEnums.type[i]][y].items);
				}
			}
		}

		return articles;
	}

	getUsersToShow() {
		if (!this.state.users) {
			return [];
		}

		let users = [];

		for (let i = 0; i < this.state.users.length; i++) {
			users = users.concat(this.state.users[i].items);
		}

		return users;
	}

	// eslint-disable-next-line class-methods-use-this
	getEntityIcon(c) {
		if (c.legal_status === "JURIDICAL PERSON") {
			return "\uf1ad";
		}
		if (c.legal_status === "NATURAL PERSON") {
			return "\uf2bb";
		}
		return "\uf111";
	}

	// eslint-disable-next-line class-methods-use-this
	getArticleIcon(a) {
		if (a.type === "NEWS") {
			return "\uf1ea";
		}
		if (a.type === "EVENT") {
			return "\uf133";
		}
		if (a.type === "JOB OFFER") {
			return "\uf0b1";
		}
		if (a.type === "RESOURCE") {
			return "\uf02d";
		}
		if (a.type === "TOOL") {
			return "\uf552";
		}
		if (a.type === "SERVICE") {
			return "\uf562";
		}
		return "\uf111";
	}

	getGraphData() {
		if (!this.props.analytics
			|| !this.props.entities
			|| !this.state.entityRelationships
			|| !this.state.entityRelationshipTypes) {
			return {
				nodes: [],
				edges: [],
			};
		}

		return {
			nodes: [
				...this.state.filters.hideEntities
					? []
					: this.props.entities.map((c) => (
						{
							id: "ent-" + c.id,
							label: c.name,
							color: { border: "#8fddff", background: "#bcebff" },
							font: { color: "grey" },
							shape: this.state.shape,
							icon: {
								face: '"Font Awesome 5 Free"',
								code: this.getEntityIcon(c),
								color: "#8fddff",
								weight: 900,
								size: 40,
							},
						}
					)),
				...this.state.filters.hideTaxonomyCategories
					? []
					: this.props.analytics.taxonomy_categories
						.filter((c) => !this.state.filters.taxonomiesToHide
							|| !this.state.filters.taxonomiesToHide.includes(c.name))
						.map((c) => (
							{
								id: "cat-" + c.name,
								label: c.name,
								color: { border: "#fed7da", background: "#ffa8b0" },
								font: { color: "grey" },
								shape: this.state.shape,
								icon: {
									face: '"Font Awesome 5 Free"',
									code: "\uf542",
									color: "#ffa8b0",
									weight: 900,
									size: 40,
								},
							}
						)),
				...this.state.filters.hideTaxonomyValues
					? []
					: this.props.analytics.taxonomy_values
						.filter((v) => !this.state.filters.taxonomiesToHide
							|| !this.state.filters.taxonomiesToHide.includes(v.category))
						.map((v) => (
							{
								id: "val-" + v.id,
								label: v.name,
								color: { border: "#ffa8b0", background: "#fed7da" },
								font: { color: "grey" },
								shape: this.state.shape,
								icon: {
									face: '"Font Awesome 5 Free"',
									code: "\uf0c8",
									color: "#fed7da",
									weight: 900,
									size: 30,
								},
							}
						)),
				...this.state.filters.hideArticles
					? []
					: this.getArticlesToShow().map((a) => (
						{
							id: "art-" + a.id,
							label: a.title,
							color: { border: "#acebb3", background: "#d5f5d9" },
							font: { color: "grey" },
							shape: this.state.shape,
							icon: {
								face: '"Font Awesome 5 Free"',
								code: this.getArticleIcon(a),
								color: "#acebb3",
								weight: 900,
								size: 30,
							},
						}
					)),
				...this.state.filters.hideUsers || !this.state.users
					? []
					: this.getUsersToShow().map((u) => (
						{
							id: "usr-" + u.id,
							label: u.email,
							color: { border: "#ffd394", background: "#fff2e1" },
							font: { color: "grey" },
							shape: this.state.shape,
							icon: {
								face: '"Font Awesome 5 Free"',
								code: "\uf007",
								color: "#ffd394",
								weight: 900,
								size: 30,
							},
						}
					)),
				...this.state.filters.hideUsers || !this.state.userGroups
					? []
					: this.state.userGroups.map((g) => (
						{
							id: "usg-" + g.id,
							label: g.name,
							color: { border: "#ffb347", background: "#ffd394" },
							font: { color: "grey" },
							shape: this.state.shape,
							icon: {
								face: '"Font Awesome 5 Free"',
								code: "\uf0c0",
								color: "#ffb347",
								weight: 900,
								size: 30,
							},
						}
					)),
			],
			edges: [
				...this.state.entityRelationships && !this.state.filters.hideEntityRelationships
					? this.state.entityRelationships.map((r) => (
						{
							from: "ent-" + r.entity_id_1,
							to: "ent-" + r.entity_id_2,
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
				...this.props.analytics && !this.state.filters.hideEntityTaxonomyLinks
					? this.props.analytics.taxonomy_assignments.map((a) => (
						{
							from: "ent-" + a.entity_id,
							to: "val-" + a.taxonomy_value_id,
							color: { color: "lightgrey" },
							width: 1,
							arrows: {
								to: {
									enabled: false,
								},
							},
							dashes: true,
						}
					))
					: [],
				...!this.state.filters.hideEntityArticleLinks
					? this.getArticlesToShow().map((a) => {
						const f = a.entity_tags.map((t) => (
							{
								from: "art-" + a.id,
								to: "ent-" + t,
								color: { color: "lightgrey" },
								width: 1,
								arrows: {
									to: {
										enabled: false,
									},
								},
								dashes: true,
							}
						));

						return f;
					}).flat()
					: [],
				...!this.state.filters.hideTaxonomyArticleLinks
					? this.getArticlesToShow().map((a) => {
						const f = a.taxonomy_tags.map((t) => (
							{
								from: "art-" + a.id,
								to: "val-" + t,
								color: { color: "lightgrey" },
								width: 1,
								arrows: {
									to: {
										enabled: false,
									},
								},
								dashes: true,
							}
						));
						return f;
					}).flat()
					: [],
				...this.state.userGroupAssignments
					? this.state.userGroupAssignments.map((a) => (
						{
							from: "usg-" + a.group_id,
							to: "usr-" + a.user_id,
							color: { color: "#ffd394" },
							width: 2,
						}
					))
					: [],
				...this.state.userEntityAssignments && !this.state.filters.hideEntityUserLinks
					? this.state.userEntityAssignments.map((a) => (
						{
							from: "usr-" + a.user_id,
							to: "ent-" + a.entity_id,
							label: a.department,
							color: { color: "lightgrey" },
							width: 1,
							arrows: {
								to: {
									enabled: false,
								},
							},
							dashes: true,
						}
					))
					: [],
			],
		};
	}

	render() {
		if (!this.props.analytics
			|| !this.props.entities
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
							<button
								className={"blue-background"}
								onClick={() => this.setState({ shape: this.state.shape === "icon" ? "box" : "icon" })}>
								{this.state.shape === "icon"
									? <i className="fas fa-closed-captioning"/>
									: <i className="fas fa-icons"/>
								}
							</button>
							<DialogDataLoader
								trigger={
									<button
										className={"blue-background"}
										data-hover="Load data">
										<i className="fas fa-tasks"/>
									</button>
								}
								parentState={this.state}
								getArticles={(t, p) => this.getArticles(t, p)}
								getUsers={(p) => this.getUsers(p)}
							/>
							<DialogGraphFilter
								trigger={
									<button
										className={"blue-background"}
										data-hover="Filter">
										<i className="fas fa-search"/>
									</button>
								}
								analytics={this.props.analytics}
								applyFilter={(filters) => this.setState({ filters })}
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
