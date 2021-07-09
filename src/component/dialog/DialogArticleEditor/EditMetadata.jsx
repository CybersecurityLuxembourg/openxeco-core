import React from "react";
import "./EditContent.css";
import { NotificationManager as nm } from "react-notifications";
import { postRequest } from "../../../utils/request.jsx";
import FormLine from "../../form/FormLine.jsx";
import { validateUrlHandle } from "../../../utils/re.jsx";

export default class EditContent extends React.Component {
	constructor(props) {
		super(props);

		this.saveArticleValue = this.saveArticleValue.bind(this);
		this.changeState = this.changeState.bind(this);

		this.state = {
			content: null,
			originalContent: null,
		};
	}

	saveArticleValue(prop, value) {
		if (this.props.article[prop] !== value) {
			const params = {
				id: this.props.article.id,
				[prop]: value,
			};

			postRequest.call(this, "private/update_my_article", params, () => {
				this.props.refreshArticle();
				nm.info("The property has been updated");
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div className="row">
				<div className="col-md-12">
					<div className={"row row-spaced"}>
						<div className="col-md-12 row-spaced">
							<h3>Metadata</h3>
						</div>

						<div className="col-md-12">
							<FormLine
								label={"Title"}
								value={this.props.article.title}
								onBlur={(v) => this.saveArticleValue("title", v)}
							/>
							<FormLine
								label={"Type"}
								type={"select"}
								value={this.props.article.type}
								options={this.props.articleEnums === null
									|| typeof this.props.articleEnums.type === "undefined" ? []
									: this.props.articleEnums.type.map((o) => ({ label: o, value: o }))}
								onChange={(v) => this.saveArticleValue("type", v)}
							/>
							<FormLine
								label={"Handle"}
								value={this.props.article.handle}
								onBlur={(v) => this.saveArticleValue("handle", v)}
								format={validateUrlHandle}
							/>
							<FormLine
								type="editor"
								label={"Abstract"}
								value={this.props.article.abstract}
								onBlur={(v) => this.saveArticleValue("abstract", v)}
							/>
							<FormLine
								type={"date"}
								label={"Publication date"}
								value={this.props.article.publication_date}
								onBlur={(v) => this.saveArticleValue("publication_date", v)}
							/>
							<FormLine
								label={"Status"}
								type={"select"}
								value={this.props.article.status}
								options={this.props.articleEnums === null
									|| typeof this.props.articleEnums.status === "undefined" ? []
									: this.props.articleEnums.status.map((o) => ({ label: o, value: o }))}
								onChange={(v) => this.saveArticleValue("status", v)}
							/>
						</div>

						{["EVENT", "JOB OFFER"].indexOf(this.props.article.type) >= 0
							&& <div className="col-md-12">
								<h2>Additional {this.props.article.type.toLowerCase()} fields</h2>
							</div>}

						{this.props.article.type === "EVENT"
							&& <div className="col-md-12">
								<FormLine
									label={"Start date"}
									type={"datetime"}
									value={this.props.article.start_date}
									onBlur={(v) => this.saveArticleValue("start_date", v.format("yyyy-MM-DDTHH:mm"))}
								/>
								<FormLine
									label={"End date"}
									type={"datetime"}
									value={this.props.article.end_date}
									onBlur={(v) => this.saveArticleValue("end_date", v.format("yyyy-MM-DDTHH:mm"))}
								/>
							</div>}

						{this.props.article.type === "JOB OFFER"
							&& <div className="col-md-12">
								<FormLine
									label={"External reference"}
									value={this.props.article.external_reference}
									disabled={true}
								/>
							</div>}
					</div>
				</div>
			</div>
		);
	}
}
