import React from "react";
import "./EntityEntities.css";
import { NotificationManager as nm } from "react-notifications";
import Popup from "reactjs-popup";
import Loading from "../box/Loading.jsx";
import Table from "../table/Table.jsx";
import { postRequest } from "../../utils/request.jsx";
import Entity from "../item/Entity.jsx";
import Website from "../item/Website.jsx";
import FormLine from "../button/FormLine.jsx";
import DialogEntityFilter from "../dialog/DialogEntityFilter.jsx";

export default class EntityEntities extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			newEntityName: null,
		};
	}

	addEntity(close) {
		const params = {
			name: this.state.newEntityName,
		};

		postRequest.call(this, "entity/add_entity", params, () => {
			this.props.refreshEntities();
			this.setState({ newEntityName: "" });
			if (close) {
				close();
			}
			nm.info("The entity has been added");
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
		const columns = [
			{
				Header: "Name",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<Entity
						id={value.id}
						name={value.name}
						legalStatus={value.legal_status}
						afterDeletion={() => this.props.refreshEntities()}
						onOpen={() => this.props.history.push("/entities/" + value.id)}
						onClose={() => this.props.history.push("/entities")}
						open={value.id.toString() === this.props.match.params.id}
						user={this.props.user}
					/>
				),
			},
			{
				Header: "Legal status",
				accessor: "legal_status",
				width: 50,
			},
			{
				Header: "Creat. date",
				accessor: "creation_date",
				width: 50,
			},
			{
				Header: "Clos. date",
				accessor: "closure_date",
				width: 50,
			},
			{
				Header: "Website",
				accessor: "website",
				Cell: ({ cell: { value } }) => (
					<Website
						url={value}
					/>
				),
				width: 50,
			},
			{
				Header: "Status",
				accessor: "status",
				width: 40,
			},
		];

		return (
			<div id="EntityEntities">
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>
							{this.props.entities ? this.props.entities.length : 0}
							&nbsp;Entit{this.props.entities && this.props.entities.length > 1 ? "ies" : "y"}
						</h1>
						<div className="top-right-buttons">
							<button
								onClick={() => this.props.refreshEntities()}>
								<i className="fas fa-redo-alt"/>
							</button>
							<Popup
								trigger={
									<button>
										<i className="fas fa-plus"/>
									</button>
								}
								modal
							>
								{(close) => <div className={"row row-spaced"}>
									<div className={"col-md-9"}>
										<h2>Add a new entity</h2>
									</div>

									<div className={"col-md-3"}>
										<div className="top-right-buttons">
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
										<FormLine
											label={"Entity name"}
											value={this.state.newEntityName}
											onChange={(v) => this.changeState("newEntityName", v)}
										/>
										<div className="right-buttons">
											<button
												onClick={() => this.addEntity(close)}
												disabled={this.state.newEntityName === null
													|| this.state.newEntityName.length < 3}>
												<i className="fas fa-plus"/> Add a new entity
											</button>
										</div>
									</div>
								</div>}
							</Popup>
							<DialogEntityFilter
								trigger={
									<button
										className={"blue-background"}
										data-hover="Filter">
										<i className="fas fa-search"/>
									</button>
								}
								filters={this.props.filters}
								applyFilter={(filters) => this.props.applyFilter(filters)}
							/>
						</div>
					</div>
					<div className="col-md-12 EntityEntities-table">
						{this.props.entities
							? <Table
								columns={columns}
								data={this.props.entities
									.filter((c) => this.props.match.params.id === undefined
										|| this.props.match.params.id === c.id.toString())}
								showBottomBar={true}
							/>
							: <Loading
								height={500}
							/>
						}
					</div>
				</div>
			</div>
		);
	}
}
