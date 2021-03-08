import React from "react";
import "./CompanyWorkforce.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";
import Loading from "../../box/Loading.jsx";
import Table from "../../table/Table.jsx";
import DialogConfirmation from "../../dialog/DialogConfirmation.jsx";

export default class CompanyWorkforce extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.addWorkforce = this.addWorkforce.bind(this);
		this.deleteWorkforce = this.deleteWorkforce.bind(this);

		this.state = {
			workforces: null,
			sources: null,
			workforce: null,
			date: null,
			source: null,
			is_estimated: false,
		};
	}

	componentDidMount() {
		this.refresh();
	}

	refresh() {
		this.setState({
			workforces: null,
			sources: null,
		});

		getRequest.call(this, "company/get_company_workforces/" + this.props.id, (data) => {
			this.setState({
				workforces: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "source/get_all_sources", (data) => {
			this.setState({
				sources: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	addWorkforce() {
		const params = {
			company: this.props.id,
			workforce: parseInt(this.state.workforce, 10),
			source: this.state.source,
			date: this.state.date,
			is_estimated: this.state.is_estimated,
		};

		postRequest.call(this, "workforce/add_workforce", params, () => {
			this.refresh();
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
		if (this.state.workforces === null || this.state.sources === null) {
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
					<div className="col-md-12">
						<h2>Workforce</h2>
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
							type={"select"}
							value={this.state.source}
							options={[{ value: null, label: "-" }].concat(
								this.state.sources.map((o) => ({ label: o, value: o })),
							)}
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
							onClick={this.addWorkforce}
							disabled={this.state.source === null || this.state.workforce === null
                                || this.state.date === null}>
							<i className="fas fa-plus"/> Add
						</button>
					</div>
				</div>
				<div className={"row"}>
					<div className="col-md-12">
						<div className="fade-in">
							<Table
								columns={columns}
								data={this.state.workforces}
							/>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
