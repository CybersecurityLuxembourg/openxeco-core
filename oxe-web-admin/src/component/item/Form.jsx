import React, { Component } from "react";
import "./Form.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { postRequest } from "../../utils/request.jsx";
import Tab from "../tab/Tab.jsx";
import FormGlobal from "./form/FormGlobal.jsx";
import FormQuestions from "./form/FormQuestions.jsx";
import FormAnswers from "./form/FormAnswers.jsx";
import { getUrlParameter } from "../../utils/url.jsx";

export default class Form extends Component {
	constructor(props) {
		super(props);

		this.confirmDeletion = this.confirmDeletion.bind(this);

		this.state = {
			taxonomy: null,
			selectedMenu: null,
			tabs: [
				"Global",
				"Questions",
				"Answers",
			],
			sync_hierarchy: true,
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
			category: this.props.name,
		};

		postRequest.call(this, "form/delete_form", params, () => {
			document.elementFromPoint(100, 0).click();
			nm.info("The taxonomy has been deleted");
			close();
			if (typeof this.props.afterDeletion !== "undefined") this.props.afterDeletion();
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
					<div className={"Form"}>
						<i className="fas fa-poll-h"/>
						<div className={"Form-name"}>
							{this.props.form.name}
						</div>
					</div>
				}
				modal
				closeOnDocumentClick={false}
			>
				{(close) => <div className="Form-content row row-spaced">
					<div className="col-md-12">
						<div className={"top-right-buttons"}>
							<button
								className={"grey-background"}
								data-hover="Close"
								data-active=""
								onClick={close}>
								<span><i className="far fa-times-circle"/></span>
							</button>
						</div>

						<h1 className="Form-title">
							<i className="fas fa-poll-h"/> {this.props.form.name}
						</h1>

						<Tab
							labels={["Global", "Questions", "Answers"]}
							selectedMenu={this.state.selectedMenu}
							onMenuClick={this.onMenuClick}
							keys={this.state.tabs}
							content={[
								<FormGlobal
									key={"global"}
									form={this.props.form}
									refresh={() => this.fetchForm()}
								/>,
								<FormQuestions
									key={"questions"}
									form={this.props.form}
									refresh={() => this.fetchForm()}
								/>,
								<FormAnswers
									key={"answers"}
									form={this.props.form}
									refresh={() => this.fetchForm()}
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
