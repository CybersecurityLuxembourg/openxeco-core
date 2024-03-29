import React, { Component } from "react";
import "./RssArticle.css";
import { NotificationManager as nm } from "react-notifications";
import dompurify from "dompurify";
import Popup from "reactjs-popup";
import Chip from "../button/Chip.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import { postRequest } from "../../utils/request.jsx";
import Entity from "./Entity.jsx";

export default class RssArticle extends Component {
	constructor(props) {
		super(props);

		this.addArticle = this.addArticle.bind(this);

		this.state = {
		};
	}

	addArticle() {
		let params = {
			title: this.props.info.title,
		};

		postRequest.call(this, "article/add_article", params, (article) => {
			nm.info("The article has been added");

			params = {
				id: article.id,
				publication_date: this.props.info.pubDate ? this.props.info.pubDate : null,
				abstract: this.props.info.description ? this.props.info.description : null,
				link: this.props.info.link ? this.props.info.link : null,
				type: "NEWS",
			};

			postRequest.call(this, "article/update_article", params, () => {
				nm.info("The article info has been updated");

				if (this.props.entity) {
					const params2 = {
						article: article.id,
						entity: this.props.entity.id,
					};

					postRequest.call(this, "article/add_entity_tag", params2, () => {
						nm.info("The entity has been tagged to the article");
					}, (response) => {
						nm.warning(response.statusText);
					}, (error) => {
						nm.error(error.message);
					});
				}
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	render() {
		return <div className="RssArticle card">
			<div className="card-body">
				<h5 className="card-title"><b>{this.props.info.title}</b></h5>

				<div className="card-text">
					<Chip
						label={this.props.info.source}
					/>
				</div>

				<div className="card-text">
					{this.props.entity
						&& <Entity
							id={this.props.entity.id}
							name={this.props.entity.name}
							legalStatus={this.props.entity.legal_status}
						/>
					}
				</div>

				<div className="card-text">
					<div dangerouslySetInnerHTML={{
						__html:
						dompurify.sanitize(this.props.info.description),
					}} />
				</div>

				<Popup
					trigger={
						<button
							className={"blue-background"}
						>
							<i className="fas fa-sign-in-alt"/> Verify and import...
						</button>
					}
					modal
					closeOnDocumentClick
					className={"Popup-full-size"}
				>
					{(close) => (
						<div className={"row"}>
							<div className={"col-md-8"}>
								<h2>
									{this.props.info.title}
								</h2>
							</div>

							<div className={"col-md-4"}>
								<div className="right-buttons">
									<button
										className={"grey-background"}
										data-hover="Close"
										data-active=""
										onClick={close}>
										<span><i className="far fa-times-circle"/></span>
									</button>
								</div>
							</div>

							<div className={"col-md-12 right-buttons row-spaced"}>
								<button
									className={"blue-background"}
									onClick={() => window.open(this.props.info.link)}
								>
									<i className="fas fa-arrow-circle-right"/> Open external website
								</button>
								<DialogConfirmation
									text={"The article will be created with the DRAFT status. "
										+ "Please review the content and change the status to PUBLIC "
										+ "to publish it."}
									trigger={
										<button
											className={"blue-background"}
											onClick={this.addArticle}
										>
											<i className="fas fa-plus"/> Add article...
										</button>
									}
									afterConfirmation={() => this.addArticle()}
								/>
							</div>

							<div className={"col-md-12 row-spaced"}>
								<h3>
									Source
								</h3>

								<Chip
									label={this.props.info.source}
								/>
							</div>

							{this.props.entity
								&& <div className={"col-md-6 row-spaced"}>
									<h3>
										Entity
									</h3>

									<Entity
										id={this.props.entity.id}
										name={this.props.entity.name}
										legalStatus={this.props.entity.legal_status}
									/>
								</div>
							}

							<div className={"col-md-6 row-spaced"}>
								<h3>
									Metadata
								</h3>

								Publication date: {this.props.info.pubDate}
							</div>

							<div className={"col-md-12"}>
								<h3>
									Description
								</h3>
							</div>

							<div className={"col-md-12 row-spaced"}>
								<div dangerouslySetInnerHTML={{
									__html:
									dompurify.sanitize(this.props.info.description),
								}} />
							</div>

							<div className={"col-md-12"}>
								<h3>
									Content
								</h3>
							</div>

							<div className={"col-md-12"}>
								<div dangerouslySetInnerHTML={{
									__html:
									dompurify.sanitize(this.props.info.content),
								}} />
							</div>
						</div>
					)}
				</Popup>

				<button
					className={"blue-background"}
					onClick={() => window.open(this.props.info.link)}
				>
					<i className="fas fa-arrow-circle-right"/> Open external website
				</button>

				<div className="card-date">
					{this.props.info.pubDate}
				</div>
			</div>
		</div>;
	}
}
