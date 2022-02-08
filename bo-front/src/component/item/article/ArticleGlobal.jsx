import React from "react";
import "./ArticleGlobal.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";
import Loading from "../../box/Loading.jsx";
import { validateUrlHandle } from "../../../utils/re.jsx";
import DialogAddImage from "../../dialog/DialogAddImage.jsx";

export default class ArticleGlobal extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.saveArticleValue = this.saveArticleValue.bind(this);

		this.state = {
			article: null,
			articleEnums: null,
		};
	}

	componentDidMount() {
		this.refresh();
	}

	refresh() {
		getRequest.call(this, "article/get_article/" + this.props.id, (data) => {
			this.setState({
				article: data,
			});

			getRequest.call(this, "public/get_article_enums", (data2) => {
				this.setState({
					articleEnums: data2,
				});
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

	saveArticleValue(prop, value) {
		if (this.state.article[prop] !== value) {
			const params = {
				id: this.props.id,
				[prop]: value,
			};

			postRequest.call(this, "article/update_article", params, () => {
				const article = { ...this.state.article };

				article[prop] = value;
				this.setState({ article });
				nm.info("The property has been updated");
			}, (response) => {
				this.refresh();
				nm.warning(response.statusText);
			}, (error) => {
				this.refresh();
				nm.error(error.message);
			});
		}
	}

	render() {
		if (this.state.article === null || this.state.articleEnums === null) {
			return <Loading height={300}/>;
		}

		return (
			<div className={"row"}>
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
					<FormLine
						label={"ID"}
						value={this.state.article.id}
						disabled={true}
					/>
					<FormLine
						type={"image"}
						label={"Cover image"}
						value={this.state.article.image}
						onChange={(v) => this.saveArticleValue("image", v)}
						height={200}
					/>
					<FormLine
						label={"Title"}
						value={this.state.article.title}
						onBlur={(v) => this.saveArticleValue("title", v)}
					/>
					<FormLine
						label={"Type"}
						type={"select"}
						value={this.state.article.type}
						options={this.state.articleEnums === null
                            || typeof this.state.articleEnums.type === "undefined" ? []
							: this.state.articleEnums.type.map((o) => ({ label: o, value: o }))}
						onChange={(v) => this.saveArticleValue("type", v)}
					/>
					<FormLine
						label={"Handle"}
						value={this.state.article.handle}
						onBlur={(v) => this.saveArticleValue("handle", v)}
						format={validateUrlHandle}
					/>
					<FormLine
						type="editor"
						label={"Abstract"}
						value={this.state.article.abstract}
						onBlur={(v) => this.saveArticleValue("abstract", v)}
						format={(v) => !v || v.length < 500}
					/>
					<FormLine
						type={"date"}
						label={"Publication date"}
						value={this.state.article.publication_date}
						onBlur={(v) => this.saveArticleValue("publication_date", v)}
					/>
					<FormLine
						label={"Status"}
						type={"select"}
						value={this.state.article.status}
						options={this.state.articleEnums === null
                            || typeof this.state.articleEnums.status === "undefined" ? []
							: this.state.articleEnums.status.map((o) => ({ label: o, value: o }))}
						onChange={(v) => this.saveArticleValue("status", v)}
					/>
				</div>

				{["NEWS", "EVENT", "JOB OFFER", "TOOL"].indexOf(this.state.article.type) >= 0
					? <div className="col-md-12">
						<h2>Additional {this.state.article.type.toLowerCase()} fields</h2>
					</div>
					: ""}

				{["NEWS", "EVENT", "JOB OFFER", "TOOL"].indexOf(this.state.article.type) >= 0
					? <div className="col-md-12">
						<FormLine
							label={"Link"}
							value={this.state.article.link}
							onBlur={(v) => this.saveArticleValue("link", v)}
						/>
					</div>
					: ""}

				{this.state.article.type === "EVENT"
					? <div className="col-md-12">
						<FormLine
							label={"Start date"}
							type={"datetime"}
							value={this.state.article.start_date}
							onBlur={(v) => this.saveArticleValue(
								"start_date",
								typeof v === "string"
									? this.state.article.start_date
									: v.format("yyyy-MM-DDTHH:mm"),
							)}
						/>
					</div>
					: ""}

				{this.state.article.type === "EVENT"
					? <div className="col-md-12">
						<FormLine
							label={"End date"}
							type={"datetime"}
							value={this.state.article.end_date}
							onBlur={(v) => this.saveArticleValue("end_date", v.format("yyyy-MM-DDTHH:mm"))}
						/>
					</div>
					: ""}

				{this.state.article.type === "JOB OFFER"
					? <div className="col-md-12">
						<FormLine
							label={"External reference"}
							value={this.state.article.external_reference}
							disabled={true}
						/>
					</div>
					: ""}
			</div>
		);
	}
}
