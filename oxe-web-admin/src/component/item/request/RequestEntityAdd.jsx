import React, { Component } from "react";
import "./RequestEntityAdd.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { postRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";

export default class RequestEntityAdd extends Component {
	constructor(props) {
		super(props);

		this.insertEntity = this.insertEntity.bind(this);

		this.state = {
		};
	}

	insertEntity() {
		if (this.props.data === undefined || this.props.data === null) {
			nm.warning("Data to be inserted not found");
			return;
		}

		if (this.props.data.id !== undefined) {
			nm.warning("Cannot add an entity with an ID");
			return;
		}

		let params = {
			name: this.props.data.name,
		};

		postRequest.call(this, "entity/add_entity", params, (addedEntity) => {
			nm.info("The entity has been created");

			params = this.props.data;
			params.id = addedEntity.id;

			postRequest.call(this, "entity/update_entity", params, () => {
				nm.info("The information of the entity has been updated");
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

	render() {
		return (
			<Popup
				className="Popup-small-size"
				trigger={
					<button
						className={"blue-background"}
					>
						<i className="fas fa-tasks"/> Review entity add
					</button>
				}
				modal
				closeOnDocumentClick
			>
				{(close) => (
					<div className="row row-spaced">
						<div className="col-md-12">
							<h2>Review entity add</h2>

							<div className={"top-right-buttons"}>
								<button
									className={"grey-background"}
									onClick={close}>
									<i className="far fa-times-circle"/>
								</button>
							</div>
						</div>

						<div className="col-md-12">
							<FormLine
								label={"Name"}
								value={this.props.data.name}
								disabled={true}
							/>
							<FormLine
								label={"Description"}
								type={"textarea"}
								value={this.props.data.description}
								disabled={true}
							/>
							<FormLine
								label={"Trade register number"}
								value={this.props.data.trade_register_number}
								disabled={true}
							/>
							<FormLine
								label={"Website"}
								value={this.props.data.website}
								disabled={true}
							/>
							<FormLine
								label={"Creation date"}
								type={"date"}
								value={this.props.data.creation_date}
								disabled={true}
							/>
							<FormLine
								label={"Is startup"}
								type={"checkbox"}
								value={this.props.data.is_startup}
								disabled={true}
							/>
						</div>

						<div className="col-md-12 right-buttons">
							<button
								className={"blue-background"}
								onClick={this.insertEntity}
							>
								<i className="fas fa-plus"/> Add entity
							</button>
						</div>
					</div>
				)}
			</Popup>
		);
	}
}
