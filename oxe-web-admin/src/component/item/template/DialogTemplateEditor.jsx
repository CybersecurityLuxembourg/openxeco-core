import React from "react";
import "./DialogTemplateEditor.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import dompurify from "dompurify";
import CodeEditor from "@uiw/react-textarea-code-editor";
import Message from "../../box/Message.jsx";
import Info from "../../box/Info.jsx";
import DialogConfirmation from "../../dialog/DialogConfirmation.jsx";
import { getRequest, postRequest } from "../../../utils/request.jsx";
import { getApiURL } from "../../../utils/env.jsx";

export default class DialogTemplateEditor extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			content: null,
			user: null,
		};
	}

	componentDidUpdate(prevProps) {
		if (prevProps.template !== this.props.template && this.props.template) {
			this.setState({ content: this.props.template.content });
		}
	}

	onOpen() {
		this.setState({
			content: this.props.template.content,
		});

		if (this.props.onOpen) {
			this.props.onOpen();
		}

		if (!this.state.user) {
			this.getMyUser();
		}
	}

	sendDraft() {
		if (this.state.user) {
			const params = {
				address: this.state.user.email,
				subject: "[DRAFT] Template test",
				content: this.getTemplateContent(),
			};

			postRequest.call(this, "mail/send_mail", params, () => {
				nm.info("The draft of the template has been sent");
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		} else {
			nm.warning("The user email has not been found");
		}
	}

	getMyUser() {
		getRequest.call(this, "private/get_my_user", (data) => {
			this.setState({
				user: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getTemplateContent() {
		return this.state.content
			.replace(
				"[CAMPAIGN CONTENT]",
				"<div"
					+ " class='DialogTemplateEditor-campaign-content'"
					+ " style='width: 100%;"
					+ " min-height: 500px;"
					+ " display: flex;"
					+ " align-items:center;"
					+ " justify-content:center;"
					+ " font-weight: bold;"
					+ " border: solid 2px lightgrey;"
					+ " background: repeating-linear-gradient("
					+ "   135deg,"
					+ "   lightgrey,"
					+ "   lightgrey 10px,"
					+ "   rgba(0, 0, 0, 0) 10px,"
					+ "   rgba(0, 0, 0, 0) 20px"
					+ " )'>"
					+ "CAMPAIGN CONTENT"
					+ "</div>",
			)
			.replaceAll("[UNSUBSCRIPTION LINK]", `<a href='${getApiURL()}account/unsubscribe'>Unsubscribe</a>`)
			.replaceAll("[LOGO]", "<img"
				+ " style='max-width: 100%; max-height: 100%;'"
				+ " src='" + getApiURL() + "public/get_public_image/logo.png'/>");
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
				className={"DialogTemplateEditor"}
				onOpen={() => this.onOpen()}
			>
				{(close) => (
					<div className="DialogTemplateEditor row">
						<div className={"col-md-9"}>
							<h1>
								Editing content
							</h1>
						</div>

						<div className={"col-md-3"}>
							<div className="right-buttons">
								<button
									className={"grey-background"}
									onClick={close}>
									<span><i className="far fa-times-circle"/></span>
								</button>
							</div>
						</div>

						{this.state.content !== this.props.template.content
							&& <div className="DialogTemplateEditor-lock"/>
						}

						<div className="DialogTemplateEditor-lock-buttons">
							<h3>Quick actions</h3>

							<button
								className={"blue-background"}
								disabled={!this.state.content || !this.state.user}
								onClick={() => this.sendDraft()}>
								<span><i className="fas fa-stethoscope"/> Send draft to myself</span>
							</button>

							<DialogConfirmation
								text={"Are you sure you want to discard the progress?"}
								trigger={
									<button
										className={"red-background"}
										disabled={this.state.content === this.props.template.content}>
										<span><i className="far fa-times-circle"/> Discard changes...</span>
									</button>
								}
								afterConfirmation={() => this.setState({ content: this.props.template.content })}
							/>

							<button
								className={"blue-background"}
								disabled={this.state.content === this.props.template.content}
								onClick={() => this.props.updateTemplate("content", this.state.content)}>
								<span><i className="fas fa-save"/> Save progress</span>
							</button>
						</div>

						<div className="col-md-12">
							<div className="DialogTemplateEditor-customised">
								<div className={"row row-spaced DialogTemplateEditor-customised"}>
									<div className="col-md-6">
										<div className={"row"}>
											<div className="col-md-12">
												<h2>Content</h2>
											</div>

											<div className="col-md-12">
												<Info
													content={<div>
														You can retrieve some example of templates <a
															href="https://github.com/CybersecurityLuxembourg/openxeco-templates/tree/master/campaign_template"
															target="_blank"
															rel="noreferrer">here</a>
													</div>}
												/>
												<Info
													content={<div>
														The content of the campaign should by defined with the following
														statement: [CAMPAIGN CONTENT]<br/><br/>
														You can include these elements:
														<ul>
															<li>[LOGO] to integrate the logo of the project</li>
															<li>[UNSUBSCRIPTION LINK] to integrate the link in
															order to &quot;Unsubscribe&quot;</li>
														</ul>
													</div>}
												/>
											</div>

											<div className="col-md-12">
												<CodeEditor
													value={this.state.content}
													language="html"
													placeholder="Please enter HTML/CSS code"
													onChange={(e) => this.setState({ content: e.target.value })}
													padding={15}
													style={{
														fontSize: 12,
														backgroundColor: "#f5f5f5",
														fontFamily: "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
													}}
												/>
											</div>
										</div>
									</div>

									<div className="col-md-6">
										<div className={"row"}>
											<div className="col-md-12">
												<h2>Preview</h2>
											</div>

											<div className="col-md-12">
												{this.state.content
													? <div
														className="DialogTemplateEditor-preview-box"
														dangerouslySetInnerHTML={{
															__html: dompurify.sanitize(
																this.getTemplateContent(),
															),
														}}>
													</div>
													: <Message
														text={"No preview available"}
													/>
												}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</Popup>
		);
	}
}
