import React from "react";
import "./TaxonomyTaxonomies.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import Taxonomy from "../item/Taxonomy.jsx";
import Loading from "../box/Loading.jsx";
import Table from "../table/Table.jsx";
import { getRequest, postRequest } from "../../utils/request.jsx";
import FormLine from "../button/FormLine.jsx";

export default class TaxonomyTaxonomies extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			categories: null,
			categoryField: "",
		};
	}

	componentDidMount() {
		this.refresh();
	}

	refresh() {
		this.setState({
			categories: null,
		});

		getRequest.call(this, "taxonomy/get_taxonomy_categories", (data) => {
			this.setState({
				categories: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	addCategory(close) {
		const params = {
			category: this.state.categoryField,
		};

		postRequest.call(this, "taxonomy/add_taxonomy_category", params, () => {
			this.refresh();
			this.setState({ categoryField: "" });
			if (close) {
				close();
			}
			nm.info("The category has been added");
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
		const categoryColumns = [
			{
				Header: "Name",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<Taxonomy
						name={value.name}
						editable={true}
						afterDeletion={() => this.refresh()}
					/>
				),
			},
			{
				id: "124",
				Header: <div align="center"><i className="fas fa-building"/></div>,
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<div align="center">{value.active_on_entities ? "Yes" : "No"}</div>
				),
				width: 40,
			},
			{
				id: "123",
				Header: <div align="center"><i className="fas fa-feather-alt"/></div>,
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => {
					if (value.active_on_articles) {
						if (value.accepted_article_types
							&& value.accepted_article_types.split(",")
								.filter((w) => w.trim().length > 0).length > 0) {
							return <div align="center">Partially</div>;
						}

						return <div align="center">Yes</div>;
					}

					return <div align="center">No</div>;
				},
				width: 40,
			},
			{
				id: "125",
				Header: <div align="center">Standard</div>,
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<div align="center">{value.is_standard ? "Yes" : "No"}</div>
				),
				width: 40,
			},
		];

		return (
			<div id="TaxonomyTaxonomies" className="max-sized-page">
				<div className={"row"}>
					<div className="col-md-9">
						<h1>
							{this.state.categories ? this.state.categories.length : 0}
							&nbsp;Taxonom{this.state.categories && this.state.categories.length > 1 ? "ies" : "y"}
						</h1>
					</div>

					<div className="col-md-3">
						<div className="top-right-buttons">
							<button
								onClick={() => this.refresh()}>
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
										<h2>Add a new taxonomy</h2>
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
											label={"Taxonomy name"}
											value={this.state.categoryField}
											onChange={(v) => this.changeState("categoryField", v)}
										/>
										<div className="right-buttons">
											<button
												onClick={() => this.addCategory(close)}
												disabled={this.state.categoryField === null
													|| this.state.categoryField.length < 3}>
												<i className="fas fa-plus"/> Add a new taxonomy
											</button>
										</div>
									</div>
								</div>}
							</Popup>
						</div>
					</div>

					<div className="col-md-12">
						{this.state.categories !== null
							? <div className="row">
								<div className="col-md-12">
									<Table
										keyBase={"Category"}
										columns={categoryColumns}
										data={this.state.categories}
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
