import React from "react";
import "./EntityWorkforce.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";
import Loading from "../../box/Loading.jsx";
import Message from "../../box/Message.jsx";
import Table from "../../table/Table.jsx";
import DialogConfirmation from "../../dialog/DialogConfirmation.jsx";

export default class EntityWorkforce extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			workforces: null,
			workforce: null,
			date: null,
			source: null,
			is_estimated: false,
		};
	}

	componentDidMount() {
		if (!this.props.node) {
			this.refresh();
		}
	}

	refresh() {
		this.setState({
			workforces: null,
		});

		getRequest.call(this, "entity/get_entity_workforces/" + this.props.id, (data) => {
			this.setState({
				workforces: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	addWorkforce(close) {
		const params = {
			entity: this.props.id,
			workforce: parseInt(this.state.workforce, 10),
			source: this.state.source,
			date: this.state.date || undefined,
			is_estimated: this.state.is_estimated,
		};

		postRequest.call(this, "workforce/add_workforce", params, () => {
			this.refresh();
			if (close) {
				close();
			}
			nm.info("The property has been added");
		}, (response) => {
			this.refresh();
			nm.warning(response.statusText);
		}, (error) => {
			this.refresh();
			nm.error(error.message);
		});
	}

	deleteWorkforce(id) {
		const params = {
			id,
		};

		postRequest.call(this, "workforce/delete_workforce", params, () => {
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

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		if (this.props.node) {
			return <Message
				text={"Not applicable on remote entity"}
				height={300}
			/>;
		}

		if (this.state.workforces === null) {
			return <Loading height={300}/>;
		}

		const columns = [
			{
				Header: "Workforce",
				accessor: "workforce",
			},
			{
				Header: "Date",
				accessor: "date",
			},
			{
				Header: "Source",
				accessor: "source",
			},
			{
				Header: "Is estimated?",
				accessor: "is_estimated",
			},
			{
				Header: " ",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<DialogConfirmation
						text={"Are you sure you want to delete this row?"}
						trigger={
							<button
								className={"small-button red-background Table-right-button"}>
								<i className="fas fa-trash-alt"/>
							</button>
						}
						afterConfirmation={() => this.deleteWorkforce(value.id)}
					/>
				),
				width: 50,
			},
		];

		return (
			<div>
				<div className={"row row-spaced"}>
					<div className="col-md-9">
						<h2>Workforce</h2>
					</div>

					<div className="col-md-3">
						<div className="top-right-buttons">
							<Popup
								trigger={
									<button
										disabled={!this.props.editable}>
										<i className="fas fa-plus"/>
									</button>
								}
								modal
							>
								{(close) => <div className={"row row-spaced"}>
									<div className={"col-md-9"}>
										<h2>Add workforce</h2>
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

									<div className="col-md-3">
										<FormLine
											label={"Workforce"}
											type={"number"}
											value={this.state.workforce}
											fullWidth={true}
											onChange={(v) => this.changeState("workforce", v)}
										/>
									</div>
									<div className="col-md-3">
										<FormLine
											label={"Date"}
											type={"date"}
											value={this.state.date}
											fullWidth={true}
											onChange={(v) => this.changeState("date", v)}
										/>
									</div>
									<div className="col-md-3">
										<FormLine
											label={"Source"}
											value={this.state.source}
											onChange={(v) => this.changeState("source", v)}
											fullWidth={true}
										/>
									</div>
									<div className="col-md-3">
										<FormLine
											label={"Is estimated?"}
											type={"checkbox"}
											value={this.state.is_estimated}
											onChange={(v) => this.changeState("is_estimated", v)}
											fullWidth={true}
										/>
									</div>
									<div className="col-md-12 right-buttons">
										<button
											className={"blue-background"}
											onClick={() => this.addWorkforce(close)}
											disabled={this.state.workforce === null}>
											<i className="fas fa-plus"/> Add workforce
										</button>
									</div>
								</div>}
							</Popup>
						</div>
					</div>

					<div className="col-md-12">
						<Table
							columns={columns}
							data={this.state.workforces}
						/>
					</div>
				</div>
			</div>
		);
	}
}
