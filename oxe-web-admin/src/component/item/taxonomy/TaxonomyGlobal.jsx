import React from "react";
import "./TaxonomyGlobal.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import Loading from "../../box/Loading.jsx";
import { getRequest, postRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";

export default class TaxonomyGlobal extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			newValue: "",
			articleEnums: null,
		};
	}

	componentDidMount() {
		this.getArticleEnums();
	}

	updateCategory(field, value) {
		const params = {
			name: this.props.name,
			[field]: value,
		};

		postRequest.call(this, "taxonomy/update_taxonomy_category", params, () => {
			this.props.refresh();
			nm.info("The taxonomy has been updated");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getArticleEnums() {
		getRequest.call(this, "public/get_article_enums", (data) => {
			this.setState({
				articleEnums: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getCategory() {
		if (this.props.name && this.props.taxonomy) {
			const categories = this.props.taxonomy.categories
				.filter((c) => c.name === this.props.name);

			if (categories.length > 0) {
				return categories[0];
			}

			return null;
		}

		return null;
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div id="TaxonomyGlobal" className={"row"}>
				<div className="col-md-12">
					<h2>Global</h2>
				</div>

				<div className="col-md-12">
					{this.props.name && this.props.taxonomy
						&& this.props.taxonomy.categories
						&& this.getCategory()
						? <div className="row">
							<div className="col-md-12">
								<FormLine
									type="checkbox"
									label={"Active on entities"}
									value={this.getCategory().active_on_companies}
									disabled={!this.props.editable}
									onChange={(v) => this.updateCategory("active_on_companies", v)}
								/>
								<FormLine
									type="checkbox"
									label={"Active on articles"}
									value={this.getCategory().active_on_articles}
									disabled={!this.props.editable}
									onChange={(v) => this.updateCategory("active_on_articles", v)}
								/>
							</div>
							<div className="col-md-6">
								<div className="FormLine-label">
									Article types
								</div>
							</div>
							<div className="col-md-6">
								<Popup
									trigger={
										<button
											disabled={!this.getCategory().active_on_articles || !this.props.editable}>
											{this.getCategory().accepted_article_types
												? this.getCategory().accepted_article_types
													.split(",")
													.filter((w) => w.trim().length > 0).length + " selected"
												: "All types"
											}
										</button>
									}
									modal
								>
									{(close) => <div className="row">
										<div className={"col-md-9"}>
											<h3>Select the type of article concerned by the taxonomy</h3>
										</div>
										<div className={"col-md-3"}>
											<div className="right-buttons">
												<button
													disabled={!this.props.editable}
													className={"grey-background"}
													onClick={close}>
													<span><i className="far fa-times-circle"/></span>
												</button>
											</div>
										</div>

										{this.state.articleEnums && this.state.articleEnums.type
											? <div className={"col-md-12"}>
												{this.state.articleEnums.type.map((t) => <FormLine
													key={this.getCategory().name + t}
													label={t}
													type={"checkbox"}
													value={this.getCategory().accepted_article_types
														&& this.getCategory().accepted_article_types.includes(t)}
													onChange={(v) => {
														const oldValue = this.getCategory().accepted_article_types || "";
														let newValue = "";

														if (v) {
															if (!oldValue.includes(t)) {
																newValue = oldValue.split(",");
																newValue.push(t);
																newValue = newValue.filter((w) => w.trim().length > 0);
																newValue = newValue.join(",");
															}
														} else {
															newValue = oldValue.split(",");
															newValue = newValue.filter((w) => w !== t && w.trim().length > 0);
															newValue = newValue.join(",");
														}

														this.updateCategory("accepted_article_types", newValue);
													}}
												/>)}
											</div>
											: <Loading
												height={200}
											/>
										}
									</div>}
								</Popup>
							</div>
							<div className="col-md-12">
								<FormLine
									type="checkbox"
									label={"Is standard?"}
									value={this.getCategory().is_standard}
									disabled={!this.props.editable}
									onChange={(v) => this.updateCategory("is_standard", v)}
								/>
							</div>
						</div>
						: <Loading
							height={300}
						/>
					}
				</div>
			</div>
		);
	}
}
