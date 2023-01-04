import React from "react";
import "./SettingMail.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../utils/request.jsx";
import FormLine from "../button/FormLine.jsx";
import Loading from "../box/Loading.jsx";
import Info from "../box/Info.jsx";
import Tab from "../tab/Tab.jsx";

export default class SettingMail extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			tabs: [
				"ACCOUNT_CREATION",
				"PASSWORD_RESET",
				"REQUEST_NOTIFICATION",
			],
			selectedTab: "ACCOUNT_CREATION",
			template: null,
			editedTemplate: null,
			content: null,
			emailDescription: [
				{
					description: "This email is sent when you create a new user from the \"Users\" page. "
						+ "The recipient of the email is the provided email address in the form. "
						+ "The email notify the new user of his/her account and his/her provisory password.",
					information: [
						"{{password}} will be replaced by the provided provisory password",
						"{{url}} will be replaced by the URL that leads to the login page",
						"{{project_name}} will be replaced by the project name defined in the global setting page",
					],
				},
				{
					description: "This email is sent when a user has forgotten his/her password. "
						+ "The recipient of the email is the provided email address in the \"I forgot my password\" from the login page. "
						+ "The email contains a URL leading to a form to define a new password.",
					information: [
						"{{url}} will be replaced by the URL that leads to the change password form",
						"{{project_name}} will be replaced by the project name defined in the global setting page",
					],
				},
				{
					description: "This email is sent when a user issue a request. "
						+ "The recipients of the email are the administrators that accepts to receive these type of communications. "
						+ "Each administrator can choose to receive or not these emails via their profile page on the admin portal.",
					information: [
						"{{url}} will be replaced by the URL that leads to the request page of the admin portal",
						"{{project_name}} will be replaced by the project name defined in the global setting page",
					],
				},
			],
		};
	}

	componentDidMount() {
		this.refresh();
	}

	componentDidUpdate(_, prevState) {
		if (prevState.selectedTab !== this.state.selectedTab) {
			this.refresh();
		}
	}

	refresh() {
		this.getTemplate();
	}

	getTemplate() {
		getRequest.call(this, "mail/get_template?name=" + this.state.selectedTab, (data) => {
			this.setState({
				template: data,
				editedTemplate: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	updateTemplate() {
		const params = {
			name: this.state.selectedTab,
			content: this.state.editedTemplate,
		};

		postRequest.call(this, "mail/update_template", params, () => {
			this.refresh();
			nm.info("The template has been updated");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	deleteTemplate() {
		const params = {
			name: this.state.selectedTab,
		};

		postRequest.call(this, "mail/delete_template", params, () => {
			this.refresh();
			nm.info("The template has been deleted");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getTabContent(description) {
		return <div className={"row row-spaced"}>
			<div className={"col-md-12 row-spaced"}/>

			<div className="col-md-6 row-spaced">
				{description.description}
			</div>
			<div className="col-md-6 row-spaced">
				{description.information
					&& description.information.map((t, i) => (
						<Info
							key={i}
							content={t}
						/>
					))
				}
			</div>

			<div className="col-md-12">
				{this.state.template
					? <div className="row">
						<div className="col-md-12">
							<FormLine
								label={"Content"}
								type={"textarea"}
								value={this.state.editedTemplate}
								onChange={(v) => this.changeState("editedTemplate", v)}
								fullWidth={true}
							/>
						</div>
						<div className="col-md-12">
							<div className="right-buttons">
								<button
									onClick={() => this.refresh()}
									disabled={this.state.template === this.state.editedTemplate}>
									<i className="far fa-times-circle"/> Discard modifications...
								</button>
								<button
									onClick={() => this.deleteTemplate()}>
									<i className="fas fa-trash-alt"/> Delete template...
								</button>
								<button
									onClick={() => this.updateTemplate()}
									disabled={this.state.template === this.state.editedTemplate}>
									<i className="fas fa-save"/> Save template
								</button>
							</div>
						</div>
					</div>
					: <Loading
						height={300}
					/>
				}
			</div>
		</div>;
	}

	onMenuClick(m) {
		this.setState({
			template: null,
			editedTemplate: null,
			selectedTab: m,
		});
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div id="SettingMail" className="max-sized-page fade-in">
				<h1>Email</h1>

				<Tab
					labels={this.state.tabs.map((n) => n.replace("_", " "))}
					keys={this.state.tabs}
					selectedMenu={this.state.selectedTab}
					onMenuClick={(m) => this.onMenuClick(m)}
					fullWidth={true}
					content={[
						this.getTabContent(this.state.emailDescription[0]),
						this.getTabContent(this.state.emailDescription[1]),
						this.getTabContent(this.state.emailDescription[2]),
					]}
				/>
			</div>
		);
	}
}
