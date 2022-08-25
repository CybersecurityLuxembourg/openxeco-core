import React from "react";
import "./UserEntity.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import Loading from "../../box/Loading.jsx";
import { getRequest, postRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";
import DialogConfirmation from "../../dialog/DialogConfirmation.jsx";

export default class UserEntity extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.getAllEntities = this.getAllEntities.bind(this);
		this.addUserEntity = this.addUserEntity.bind(this);
		this.deleteUserEntity = this.deleteUserEntity.bind(this);

		this.state = {
			userEntities: null,
			selectedEntity: null,
			selectedDepartment: null,
			allEntities: null,
			userEntitiesEnums: null,
		};
	}

	componentDidMount() {
		this.refresh();
		this.getAllEntities();
	}

	refresh() {
		getRequest.call(this, "user/get_user_entity_enums", (data) => {
			this.setState({
				userEntitiesEnums: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "user/get_user_entities/" + this.props.id, (data) => {
			this.setState({
				userEntities: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getAllEntities() {
		getRequest.call(this, "entity/get_entities", (data) => {
			this.setState({
				allEntities: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	addUserEntity(close) {
		const params = {
			user_id: this.props.id,
			entity_id: this.state.selectedEntity,
			department: this.state.selectedDepartment,
		};

		postRequest.call(this, "user/add_user_entity", params, () => {
			this.refresh();
			nm.info("The entity has been added to the user");
			close();
		}, (response) => {
			this.refresh();
			nm.warning(response.statusText);
		}, (error) => {
			this.refresh();
			nm.error(error.message);
		});
	}

	deleteUserEntity(id) {
		const params = {
			user: this.props.id,
			entity: id,
		};

		postRequest.call(this, "user/delete_user_entity", params, () => {
			this.refresh();
			nm.info("The row has been deleted");
		}, (response) => {
			this.refresh();
			nm.warning(response.statusText);
		}, (error) => {
			this.refresh();
			nm.error(error.message);
		});
	}

	updateUserEntity(entity, department) {
		const params = {
			user: this.props.id,
			entity,
			department,
		};

		postRequest.call(this, "user/update_user_entity", params, () => {
			this.refresh();
			nm.info("The assignment has been updated");
		}, (response) => {
			this.refresh();
			nm.warning(response.statusText);
		}, (error) => {
			this.refresh();
			nm.error(error.message);
		});
	}

	getEntityFromId(entityId) {
		if (this.state.allEntities) {
			const filteredEntities = this.state.allEntities.filter((c) => c.id === entityId);

			if (filteredEntities.length > 0) {
				return filteredEntities[0];
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
			<div className={"row"}>
				<div className="col-md-12">
					<div className={"top-right-buttons"}>
						<Popup
							className="Popup-small-size"
							trigger={
								<button
									className={"blue-background"}>
									<i className="fas fa-plus"/>
								</button>
							}
							modal
							closeOnDocumentClick
						>
							{(close) => <div className="row row-spaced">
								<div className="col-md-12">
									<h2>Add an assignment to an entity</h2>

									<div className={"top-right-buttons"}>
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
									{this.state.allEntities
										&& this.state.userEntitiesEnums
										? <div>
											<FormLine
												label={"Entity"}
												type={"select"}
												value={this.state.selectedEntity}
												options={this.state.allEntities === null ? []
													: [{ value: null, label: "-" }].concat(
														this.state.allEntities.map((c) => ({ label: c.name, value: c.id })),
													)}
												onChange={(v) => this.setState({ selectedEntity: v })}
											/>
											<FormLine
												label={"Department"}
												type={"select"}
												value={this.state.selectedDepartment}
												options={this.state.userEntitiesEnums === null
													|| this.state.userEntitiesEnums.department === undefined
													? []
													: [{ value: null, label: "-" }].concat(
														this.state.userEntitiesEnums
															.department.map((o) => ({ label: o, value: o })),
													)}
												onChange={(v) => this.setState({ selectedDepartment: v })}
											/>
											<div className="right-buttons">
												<button
													onClick={() => this.addUserEntity(close)}
													disabled={this.state.selectedEntity === null}>
													Add the assignment
												</button>
											</div>
										</div>
										: <Loading
											height={150}
										/>
									}
								</div>
							</div>}
						</Popup>
					</div>

					<h2>Assigned entities</h2>
				</div>

				<div className="col-md-12">
					{this.state.userEntities
						? (this.state.userEntities.map((c) => (
							<div className={"row-spaced"} key={c.entity_id}>
								<h4>
									{this.getEntityFromId(c.entity_id)
										? this.getEntityFromId(c.entity_id).name
										: "Name not found"
									}
								</h4>

								<FormLine
									label={"Department"}
									type={"select"}
									options={this.state.userEntitiesEnums
										? this.state.userEntitiesEnums.department
											.map((d) => ({ label: d, value: d }))
										: []
									}
									value={c.department} // TODO
									onChange={(v) => this.updateUserEntity(c.entity_id, v)}
								/>

								<DialogConfirmation
									text={"Are you sure you want to delete this row?"}
									trigger={
										<button
											className={"red-background Table-right-button"}>
											<i className="fas fa-trash-alt"/> Remove the assignment
										</button>
									}
									afterConfirmation={() => this.deleteUserEntity(c.entity_id)}
								/>

							</div>
						)))
						: <Loading
							height={200}
						/>
					}
				</div>
			</div>
		);
	}
}
