import React from "react";
import "./DialogAddArticle.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import FormLine from "../form/FormLine.jsx";
import { validateArticleTitle } from "../../utils/re.jsx";
import { postRequest } from "../../utils/request.jsx";

export default class DialogAddArticle extends React.Component {
	constructor(props) {
		super(props);

		this.addArticle = this.addArticle.bind(this);

		this.state = {
			title: null,
			company: this.props.myCompanies !== null
				&& this.props.myCompanies !== undefined
				&& this.props.myCompanies.length > 0
				? this.props.myCompanies[0].id
				: null,
		};
	}

	componentDidUpdate(prevProps) {
		if ((prevProps.myCompanies === null || prevProps.myCompanies === undefined)
			&& Array.isArray(this.props.myCompanies)
			&& this.props.myCompanies.length > 0) {
			this.setState({ company: this.props.myCompanies[0].id });
		}
	}

	addArticle(close) {
		postRequest.call(this, "private/add_my_article", this.state, () => {
			nm.info("The article has been created");
			close();

			if (this.props.afterConfirmation !== undefined) {
				this.props.afterConfirmation();
			}
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<Popup
				trigger={this.props.trigger}
				modal
				closeOnDocumentClick
				className={"DialogAddArticle"}
			>
				{(close) => (
					<div className={"row DialogAddArticle-wrapper"}>
						<div className={"col-md-12"}>
							<h2>Add a new article</h2>
						</div>

						<div className={"col-md-12"}>
							<FormLine
								label={"Title"}
								value={this.state.title}
								onChange={(v) => this.changeState("title", v)}
								format={validateArticleTitle}
							/>
							<FormLine
								label={"Entity"}
								type={"select"}
								value={this.state.company}
								options={this.props.myCompanies === null
									|| this.props.myCompanies === undefined
									? []
									: this.props.myCompanies.map((o) => ({ label: o.name, value: o.id }))
								}
								onChange={(v) => this.changeState("company", v)}
								format={this.state.company === null}
							/>
						</div>

						<div className={"col-md-12"}>
							<div className={"right-buttons"}>
								<button
									className={"grey-background"}
									onClick={close}>
									<span><i className="far fa-times-circle"/> Cancel</span>
								</button>
								<button
									onClick={() => this.addArticle(close)}
									disabled={!validateArticleTitle(this.state.title)
										|| this.state.company === null}>
									<span><i className="fas fa-plus"/> Add article</span>
								</button>
							</div>
						</div>
					</div>
				)}
			</Popup>
		);
	}
}
