import React from "react";
import "./CampaignTemplate.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../utils/request.jsx";
import FormLine from "../button/FormLine.jsx";
import DialogTemplateEditor from "./template/DialogTemplateEditor.jsx";
import Item from "./Item.jsx";
import Loading from "../box/Loading.jsx";

export default class CampaignTemplate extends Item {
	constructor(props) {
		super(props);

		this.state = {
			template: null,
		};
	}

	fetchTemplate() {
		getRequest.call(this, "campaign/get_campaign_template/" + this.props.info.id, (data) => {
			this.setState({
				template: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	updateTemplate(prop, value) {
		if (this.props.info[prop] !== value) {
			const params = {
				id: this.props.info.id,
				[prop]: value,
			};

			postRequest.call(this, "campaign/update_campaign_template", params, () => {
				this.fetchTemplate();
				nm.info("The property has been updated");
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	render() {
		return (
			<Popup
				className="Popup-small-size"
				trigger={
					<div className={"Item CampaignTemplate"}>
						<i className="fas fa-file-code"/>
						<div className={"name"}>
							{this.props.info.name || "No name"}
						</div>
					</div>
				}
				modal
				closeOnDocumentClick={false}
				onOpen={() => this.fetchTemplate()}
				onClose={this.props.onClose && (() => this.props.onClose())}
			>
				{(close) => <div className="row">
					<div className={"col-md-9"}>
						<h1>
							<i className="fas fa-file-code"/> {this.props.info.name || "No name"}
						</h1>
					</div>

					<div className={"col-md-3"}>
						<div className="right-buttons">
							<button
								className={"grey-background"}
								data-hover="Close"
								data-active=""
								onClick={close}>
								<span><i className="far fa-times-circle"/></span>
							</button>
						</div>
					</div>

					{this.state.template
						? <div className="col-md-12">
							<FormLine
								label={"Name"}
								value={this.state.template.name}
								onBlur={(v) => this.updateTemplate("name", v)}
							/>
							<div className={"FormLine"}>
								<div className={"row"}>
									<div className={"col-md-6"}>
										<div className={"FormLine-label"}>
											Content
										</div>
									</div>
									<div className={"col-md-6"}>
										<DialogTemplateEditor
											trigger={
												<button
													className={"blue-background full-size"}
												>
													<i className="far fa-edit"/> Open editor
												</button>
											}
											template={this.state.template}
											updateTemplate={(p, v) => this.updateTemplate(p, v)}
										/>
									</div>
								</div>
							</div>
						</div>
						: <Loading
							height={150}
						/>
					}
				</div>}
			</Popup>
		);
	}
}
