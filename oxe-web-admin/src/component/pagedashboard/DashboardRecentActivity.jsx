import React from "react";
import "./DashboardRecentActivity.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../../utils/request.jsx";
import Loading from "../box/Loading.jsx";
import Message from "../box/Message.jsx";
import Entity from "../item/Entity.jsx";
import Article from "../item/Article.jsx";
import Note from "../item/Note.jsx";
import Taxonomy from "../item/Taxonomy.jsx";
import User from "../item/User.jsx";

export default class DashboardRecentActivity extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			notes: null,
		};
	}

	componentDidMount() {
		this.refresh();
	}

	refresh() {
		this.getLastArticlesByType("lastEvents", "EVENT");
		this.getLastArticlesByType("lastNews", "NEWS");
		this.getLastArticlesByType("lastJobOffers", "JOB OFFER");
		this.getLastArticlesByType("lastServices", "SERVICE");
		this.getLastArticlesByType("lastTools", "TOOL");
		this.getLastArticlesByType("lastResources", "RESOURCE");
		this.getNotes();
	}

	getLastArticlesByType(stateVar, type) {
		this.setState({ [stateVar]: null }, () => {
			getRequest.call(this, "public/get_public_articles?type=" + type + "&per_page=5", (data) => {
				this.setState({
					[stateVar]: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	getNotes() {
		this.setState({ notes: null }, () => {
			getRequest.call(this, "note/get_notes?per_page=10", (data) => {
				this.setState({
					notes: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	buildArticleBlock(typeName, stateVar) {
		return <div className="col-md-6 row-spaced">
			<h3>
				Last public {typeName}
			</h3>

			<div>
				{this.state[stateVar] && this.state[stateVar].items.length > 0
					&& this.state[stateVar].items.map((o) => (
						<Article
							key={o.id}
							id={o.id}
							name={o.title}
							afterDeletion={() => this.refresh()}
						/>
					))
				}

				{this.state[stateVar] && this.state[stateVar].items.length === 0
					&& <Message
						text={"No data found"}
						height={160}
					/>
				}

				{!this.state[stateVar]
					&& <Loading
						height={160}
					/>
				}
			</div>
		</div>;
	}

	render() {
		return (
			<div id={"DashboardRecentActivity"}>
				<div className={"row"}>
					<div className="col-md-9">
						<h1>Recent activities</h1>
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

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h2>Entities</h2>
					</div>
					<div className="col-md-12 row-spaced">
						<div>
							{this.props.entities && this.props.entities.length > 0
								&& this.props.entities
									.slice(Math.max(this.props.entities.length - 10, 0))
									.reverse()
									.map((o) => (
										<Entity
											key={o.id}
											id={o.id}
											name={o.name}
											legalStatus={o.legal_status}
										/>
									))
							}

							{this.props.entities && this.props.entities.length === 0
								&& <Message
									text={"No data found"}
									height={160}
								/>
							}

							{!this.props.entities
								&& <Loading
									height={160}
								/>
							}
						</div>
					</div>

					<div className="col-md-12">
						<h2>Articles</h2>
					</div>

					{this.buildArticleBlock("news", "lastNews")}
					{this.buildArticleBlock("events", "lastEvents")}
					{this.buildArticleBlock("job offers", "lastJobOffers")}
					{this.buildArticleBlock("services", "lastServices")}
					{this.buildArticleBlock("tools", "lastTools")}
					{this.buildArticleBlock("resources", "lastResources")}

					<div className="col-md-12">
						<h2>Notes</h2>
					</div>

					<div className="col-md-12 row-spaced">
						<div>
							{this.state.notes && this.state.notes.pagination.total > 0
								&& this.state.notes.items
									.map((o) => (
										<div key={o.id}>
											{o.entity
												&& <Entity
													id={o.entity}
												/>
											}

											{o.article
												&& <Article
													id={o.article}
												/>
											}

											{o.taxonomy_category
												&& <Taxonomy
													id={o.taxonomy_category}
												/>
											}

											{o.user
												&& <User
													id={o.user}
												/>
											}

											<Note
												key={o.id}
												note={o}
											/>
										</div>
									))
							}

							{this.state.notes && this.state.notes.pagination.total === 0
								&& <Message
									text={"No data found"}
									height={160}
								/>
							}

							{!this.state.notes
								&& <Loading
									height={160}
								/>
							}
						</div>
					</div>
				</div>
			</div>
		);
	}
}
