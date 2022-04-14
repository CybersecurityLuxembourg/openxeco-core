import React from "react";
import "./FormForms.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import Form from "../item/Form.jsx";
import Loading from "../box/Loading.jsx";
import DynamicTable from "../table/DynamicTable.jsx";
import { getRequest, postRequest } from "../../utils/request.jsx";
import FormLine from "../button/FormLine.jsx";
import { dictToURI } from "../../utils/url.jsx";

export default class FormForms extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			forms: null,
			newFormName: "",
			pagination: null,
			page: 1,
		};
	}

	componentDidMount() {
		this.fetchForms();
	}

	fetchForms(page) {
		const filters = {
			page: Number.isInteger(page) ? page : this.state.page,
			per_page: 10,
		};

		getRequest.call(this, "form/get_forms?" + dictToURI(filters), (data) => {
			this.setState({
				forms: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	addForm(close) {
		const params = {
			name: this.state.newFormName,
		};

		postRequest.call(this, "form/add_form", params, () => {
			this.fetchForms();
			this.setState({ newFormName: null });
			nm.info("The form has been added");

			if (close) {
				close();
			}
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
				accessor: (f) => f,
				Cell: ({ cell: { value } }) => (
					<Form
						form={value}
						editable={true}
						afterDeletion={() => this.fetchForms()}
					/>
				),
			},
			{
				id: "125",
				Header: <div align="center">Status</div>,
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<div align="center">{value.status}</div>
				),
				width: 40,
			},
		];

		return (
			<div id="FormForms" className="max-sized-page">
				<div className={"row"}>
					<div className="col-md-12">
						<h1>Forms</h1>

						<div className="top-right-buttons">
							<button
								onClick={() => this.fetchForms()}>
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
										<h2>Add a new form</h2>
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
											label={"Form name"}
											value={this.state.newFormName}
											onChange={(v) => this.changeState("newFormName", v)}
										/>
										<div className="right-buttons">
											<button
												onClick={() => this.addForm(close)}
												disabled={this.state.newFormName === null
													|| this.state.newFormName.length < 3}>
												<i className="fas fa-plus"/> Add a new form
											</button>
										</div>
									</div>
								</div>}
							</Popup>
						</div>
					</div>

					<div className="col-md-12">
						{this.state.forms
							? <div className="row">
								<div className="col-md-12">
									<DynamicTable
										columns={columns}
										data={this.state.forms.items}
										pagination={this.state.forms.pagination}
										changePage={this.fetchForms}
									/>
								</div>
							</div>
							: <Loading
								height={100}
							/>
						}
					</div>
				</div>
			</div>
		);
	}
}
