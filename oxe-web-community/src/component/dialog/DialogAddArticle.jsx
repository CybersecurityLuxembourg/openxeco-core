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
			entity: this.props.myEntities !== null
				&& this.props.myEntities !== undefined
				&& this.props.myEntities.length > 0
				? this.props.myEntities[0].id
				: null,
		};
	}

	componentDidUpdate(prevProps) {
		if ((prevProps.myEntities === null || prevProps.myEntities === undefined)
			&& Array.isArray(this.props.myEntities)
			&& this.props.myEntities.length > 0) {
			this.setState({ entity: this.props.myEntities[0].id });
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
								value={this.state.entity}
								options={this.props.myEntities === null
									|| this.props.myEntities === undefined
									? []
									: this.props.myEntities.map((o) => ({ label: o.name, value: o.id }))
								}
								onChange={(v) => this.changeState("entity", v)}
								format={this.state.entity === null}
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
										|| this.state.entity === null}>
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
