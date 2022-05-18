import React from "react";
import "./ArticleGlobal.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, getForeignRequest, postRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";
import Loading from "../../box/Loading.jsx";
import { validateUrlHandle } from "../../../utils/re.jsx";
import DialogAddImage from "../../dialog/DialogAddImage.jsx";

export default class ArticleGlobal extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			articleEnums: null,
			showOptionalFields: false,
		};
	}

	componentDidMount() {
		this.getArticleEnums();
	}

	getArticleEnums() {
		if (this.props.node && this.props.node.api_endpoint) {
			const url = this.props.node.api_endpoint + "/public/get_public_article_enums";

			getForeignRequest.call(this, url, (data2) => {
				this.setState({
					articleEnums: data2,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		} else {
			getRequest.call(this, "public/get_public_article_enums", (data2) => {
				this.setState({
					articleEnums: data2,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	saveArticleValue(prop, value) {
		if (this.props.article[prop] !== value) {
			const params = {
				id: this.props.id,
				[prop]: value,
			};

			postRequest.call(this, "article/update_article", params, () => {
				this.props.refresh();
				nm.info("The property has been updated");
			}, (response) => {
				this.props.refresh();
				nm.warning(response.statusText);
			}, (error) => {
				this.props.refresh();
				nm.error(error.message);
			});
		}
	}

	render() {
		if (!this.props.article || !this.state.articleEnums) {
			return <Loading height={300} />;
		}

		return (
			<div id="ArticleGlobal" className={"row"}>
				<div className="Article-action-buttons-wrapper">
					<div className={"Article-action-buttons"}>
						<h3>Quick actions</h3>
						<div>
							<DialogAddImage
								trigger={
									<button
										className={"blue-background"}
										data-hover="Filter">
										<i className="fas fa-plus"/> Add image
									</button>
								}
							/>
						</div>
					</div>
				</div>

				<div className="col-md-12">
					<h2>Global</h2>
				</div>

				<div className="col-md-12">
					<h3>Identity</h3>
				</div>

				<div className="col-md-6 row-spaced">
					<FormLine
						type={"image"}
						label={""}
						value={this.props.article.image}
						onChange={(v) => this.saveArticleValue("image", v)}
						height={200}
						disabled={!this.props.editable}
						fullWidth={true}
					/>
				</div>

				<div className="col-md-6">
					<FormLine
						label={"Status"}
						type={"select"}
						value={this.props.article.status}
						options={this.state.articleEnums === null
							|| typeof this.state.articleEnums.status === "undefined" ? []
							: this.state.articleEnums.status.map((o) => ({ label: o, value: o }))}
						onChange={(v) => this.saveArticleValue("status", v)}
						disabled={!this.props.editable}
					/>
					<FormLine
						label={"ID"}
						value={this.props.article.id}
						disabled={true}
					/>
					<FormLine
						label={"Title"}
						value={this.props.article.title}
						onBlur={(v) => this.saveArticleValue("title", v)}
						disabled={!this.props.editable}
						fullWidth={true}
					/>
				</div>

				<div className="col-md-12">
					<h3>Definition</h3>
				</div>

				<div className="col-md-12">
					<FormLine
						label={"Type"}
						type={"select"}
						value={this.props.article.type}
						options={this.state.articleEnums === null
							|| typeof this.state.articleEnums.type === "undefined" ? []
							: this.state.articleEnums.type.map((o) => ({ label: o, value: o }))}
						onChange={(v) => this.saveArticleValue("type", v)}
						disabled={!this.props.editable}
					/>
					<FormLine
						label={"Handle"}
						value={this.props.article.handle}
						onBlur={(v) => this.saveArticleValue("handle", v)}
						format={validateUrlHandle}
						disabled={!this.props.editable}
					/>
					<FormLine
						type="editor"
						label={"Abstract"}
						value={this.props.article.abstract}
						onBlur={(v) => this.saveArticleValue("abstract", v)}
						format={(v) => !v || v.length < 500}
						disabled={!this.props.editable}
					/>
					<FormLine
						type={"datetime"}
						label={"Publication date"}
						value={this.props.article.publication_date}
						onBlur={(v) => this.saveArticleValue(
							"publication_date",
							typeof v === "string"
								? this.props.article.start_date
								: v.format("yyyy-MM-DDTHH:mm"),
						)}
						disabled={!this.props.editable}
					/>
				</div>

				<div className="col-md-12">
					{["NEWS", "EVENT", "JOB OFFER", "TOOL", "SERVICE"].indexOf(this.props.article.type) >= 0
						&& <div className="right-buttons">
							<button
								className="link-button"
								onClick={() => this.setState({
									showOptionalFields: !this.state.showOptionalFields,
								})}>
								{this.state.showOptionalFields ? "Hide" : "Show"}
								&nbsp;optional fields for {this.props.article.type.toLowerCase()}
							</button>
						</div>}
				</div>

				<div className="col-md-12">
					{(["NEWS", "EVENT", "JOB OFFER", "TOOL", "SERVICE"].indexOf(this.props.article.type) >= 0
						|| this.state.showOptionalFields)
						&& <FormLine
							label={"Link"}
							value={this.props.article.link}
							onBlur={(v) => this.saveArticleValue("link", v)}
							disabled={!this.props.editable}
						/>}

					{(this.props.article.type === "EVENT"
						|| this.state.showOptionalFields)
						&& <FormLine
							label={"Start date"}
							type={"datetime"}
							value={this.props.article.start_date}
							onBlur={(v) => this.saveArticleValue(
								"start_date",
								typeof v === "string" || v === null
									? this.props.article.start_date
									: v.format("yyyy-MM-DDTHH:mm"),
							)}
							disabled={!this.props.editable}
						/>}

					{(this.props.article.type === "EVENT"
						|| this.state.showOptionalFields)
						&& <FormLine
							label={"End date"}
							type={"datetime"}
							value={this.props.article.end_date}
							onBlur={(v) => this.saveArticleValue(
								"end_date",
								typeof v === "string" || v === null
									? this.props.article.start_date
									: v.format("yyyy-MM-DDTHH:mm"),
							)}
							disabled={!this.props.editable}
						/>}

					{(this.props.article.type === "JOB OFFER"
						|| this.state.showOptionalFields)
						&& <FormLine
							label={"External reference"}
							value={this.props.article.external_reference}
							disabled={true}
						/>}
				</div>
			</div>
		);
	}
}
