import React from "react";
import "./Form.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { postRequest } from "../../utils/request.jsx";
import Tab from "../tab/Tab.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import FormGlobal from "./form/FormGlobal.jsx";
import FormQuestions from "./form/FormQuestions.jsx";
import FormAnswers from "./form/FormAnswers.jsx";
import FormExport from "./form/FormExport.jsx";
import { getUrlParameter } from "../../utils/url.jsx";
import Item from "./Item.jsx";

export default class Form extends Item {
	constructor(props) {
		super(props);

		this.state = {
			selectedMenu: null,
			tabs: [
				"global",
				"questions",
				"answers",
				"export",
			],
		};
	}

	componentDidMount() {
		if (getUrlParameter("item_tab") !== null && this.state.tabs.indexOf(getUrlParameter("item_tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("item_tab") });
		}
	}

	componentDidUpdate() {
		if (this.state.selectedMenu !== getUrlParameter("item_tab")
			&& this.state.tabs.indexOf(getUrlParameter("item_tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("item_tab") });
		}
	}

	onClick() {
		if (typeof this.props.disabled !== "undefined" || !this.props.disabled) {
			this.onOpen();

			const newState = !this.props.selected;
			if (typeof this.props.onClick !== "undefined") this.props.onClick(this.props.id, newState);
		}
	}

	confirmDeletion(close) {
		const params = {
			id: this.props.form.id,
		};

		postRequest.call(this, "form/delete_form", params, () => {
			nm.info("The form has been deleted");
			close();
			if (this.props.afterDeletion) this.props.afterDeletion();
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
				className="Popup-full-size"
				trigger={
					<div className={"Item Form"}>
						<i className="fas fa-poll-h"/>
						<div className={"name"}>
							{this.props.form.name}
						</div>
					</div>
				}
				modal
				closeOnDocumentClick={false}
			>
				{(close) => <div className="Form-content row row-spaced">
					<div className="col-md-9">
						<h1 className="title">
							<i className="fas fa-poll-h"/> {this.props.form.name}
						</h1>
					</div>

					<div className="col-md-3">
						<div className={"right-buttons"}>
							<DialogConfirmation
								text={"Are you sure you want to delete this form?"}
								trigger={
									<button
										className={"red-background"}>
										<i className="fas fa-trash-alt"/>
									</button>
								}
								afterConfirmation={() => this.confirmDeletion(close)}
							/>
							<button
								className={"grey-background"}
								data-hover="Close"
								data-active=""
								onClick={close}>
								<span><i className="far fa-times-circle"/></span>
							</button>
						</div>
					</div>

					<div className="col-md-12">
						<Tab
							labels={["Global", "Questions", "Answers", "Export"]}
							selectedMenu={this.state.selectedMenu}
							onMenuClick={this.onMenuClick}
							keys={this.state.tabs}
							content={[
								<FormGlobal
									key={this.state.tabs[0]}
									form={this.props.form}
								/>,
								<FormQuestions
									key={this.state.tabs[1]}
									form={this.props.form}
								/>,
								<FormAnswers
									key={this.state.tabs[2]}
									form={this.props.form}
								/>,
								<FormExport
									key={this.state.tabs[3]}
									form={this.props.form}
								/>,
							]}
						/>
					</div>
				</div>
				}
			</Popup>
		);
	}
}
