import React from "react";
import "./EditMetadata.css";
import FormLine from "../../form/FormLine.jsx";
import { validateUrlHandle } from "../../../utils/re.jsx";
import DialogHint from "../DialogHint.jsx";

export default class EditMetadata extends React.Component {
	constructor(props) {
		super(props);

		this.getStatusOptions = this.getStatusOptions.bind(this);
		this.changeState = this.changeState.bind(this);

		this.state = {
			content: null,
			originalContent: null,
		};
	}

	getAvailableArticleType() {
		if (this.props.articleEnums !== null
			&& this.props.articleEnums.type !== undefined
			&& this.props.settings !== null
			&& this.props.settings.AUTHORIZED_ARTICLE_TYPES_FOR_ECOSYSTEM !== undefined) {
			return this.props.settings.AUTHORIZED_ARTICLE_TYPES_FOR_ECOSYSTEM
				.split(",")
				.filter((t) => this.props.articleEnums.type.indexOf(t) >= 0);
		}

		return [];
	}

	getStatusOptions() {
		if (this.props.articleEnums === null
			|| this.props.articleEnums.status === undefined
			|| this.props.settings === null) {
			return [];
		}

		if (this.props.settings.DEACTIVATE_REVIEW_ON_ECOSYSTEM_ARTICLE === "TRUE") {
			return this.props.articleEnums.status
				.filter((o) => o !== "UNDER REVIEW")
				.map((o) => ({ label: o, value: o }));
		}

		return this.props.articleEnums.status
			.filter((o) => o !== "PUBLIC")
			.map((o) => ({ label: o, value: o }));
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div className="EditMetadata row">
				<div className="col-md-12">
					<div className={"row row-spaced"}>
						<div className="col-md-12">
							<h3>
								Metadata

								<DialogHint
									content={
										<div className="row">
											<div className="col-md-12">
												<h2>What are the metadata fields?</h2>

												<p>
													The metadata fields are the information related to an
													article that is not concerning the body itself. The
													&quot;Edit metadata&quot; tab shows them all.
												</p>

												<img src="img/hint-edit-metadata.png"/>

												<p>
													Here is an explanation for each of them:
												</p>

												<img src="img/hint-metadata-fields.png"/>

												<ul>
													<li><b>Title</b>: main title of the article</li>
													<li>
														<b>Type</b>: type of article amongst this list:&nbsp;
														{this.props.settings !== null
															&& this.props.settings.AUTHORIZED_ARTICLE_TYPES_FOR_ECOSYSTEM
																!== undefined
															&& this.props.settings.AUTHORIZED_ARTICLE_TYPES_FOR_ECOSYSTEM
																.split(",")
																.map((t) => t)
																.join(", ")
														}
													</li>
													<li>
														<b>Handle</b>: the URL path that will define the article of the
														article URL
													</li>
													<li>
														<b>Abstract</b>: the summary that introduces the content of the article
													</li>
													<li>
														<b>Publication date</b>: the date of publication of the article.
														If the date is in the future, the article won&apos;t be public
														until the specified date is reached
													</li>
													<li>
														<b>Status</b>:

														<ul>
															<li>
																<b>DRAFT</b>: the article is in edition.
																It won&apos;t be shown publicly
															</li>
															<li>
																<b>PUBLIC</b>: the article is ready and complete.
																This is the right status to set it online.
															</li>
															<li>
																<b>ARCHIVE</b>: the article is saved in the
																database but inaccessible online
															</li>
														</ul>
													</li>
												</ul>

												<p>
													There are some additional fields according to the selected type:
												</p>

												<img src="img/hint-additional-metadata-fields.png"/>

												<ul>
													<li>
														<b>Start date</b>: Date and time of the start of the object
													</li>
													<li>
														<b>End date</b>: Date and time of the end of the object
													</li>
												</ul>
											</div>
										</div>
									}
								/>
							</h3>
						</div>

						<div className="col-md-12">
							<FormLine
								label={"Title"}
								value={this.props.article.title}
								onBlur={(v) => this.props.saveArticleValue("title", v)}
							/>
							<FormLine
								label={"Type"}
								type={"select"}
								value={this.props.article.type}
								options={this.getAvailableArticleType().map((o) => ({ label: o, value: o }))}
								onChange={(v) => this.props.saveArticleValue("type", v)}
							/>
							<FormLine
								label={"Handle"}
								value={this.props.article.handle}
								onBlur={(v) => this.props.saveArticleValue("handle", v)}
								format={validateUrlHandle}
							/>
							<FormLine
								type="editor"
								label={"Abstract"}
								value={this.props.article.abstract}
								onBlur={(v) => this.props.saveArticleValue("abstract", v)}
								format={(v) => !v || v.length <= 500}
							/>
							<FormLine
								type={"date"}
								label={"Publication date"}
								value={this.props.article.publication_date}
								onBlur={(v) => this.props.saveArticleValue("publication_date", v)}
							/>
							<FormLine
								label={"Status"}
								type={"select"}
								value={this.props.article.status}
								options={this.getStatusOptions()}
								onChange={(v) => this.props.saveArticleValue("status", v)}
							/>
						</div>

						{["EVENT"].indexOf(this.props.article.type) >= 0
							&& <div className="col-md-12">
								<h3>Additional fields for {this.props.article.type.toLowerCase()} articles</h3>
							</div>}

						{this.props.article.type === "EVENT"
							&& <div className="col-md-12">
								<FormLine
									label={"Start date"}
									type={"datetime"}
									value={this.props.article.start_date}
									onBlur={(v) => this.props.saveArticleValue("start_date", v === null ? v : v.format("yyyy-MM-DDTHH:mm"))}
								/>
								<FormLine
									label={"End date"}
									type={"datetime"}
									value={this.props.article.end_date}
									onBlur={(v) => this.props.saveArticleValue("end_date", v === null ? v : v.format("yyyy-MM-DDTHH:mm"))}
								/>
							</div>}
					</div>
				</div>
			</div>
		);
	}
}
