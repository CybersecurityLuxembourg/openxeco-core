import React from "react";
import "./PageCompany.css";
import { NotificationManager as nm } from "react-notifications";
import Loading from "./box/Loading.jsx";
import Table from "./table/Table.jsx";
import { getRequest, postRequest, getBlobRequest } from "../utils/request.jsx";
import Company from "./item/Company.jsx";
import Website from "./item/Website.jsx";
import FormLine from "./button/FormLine.jsx";
import DialogCompanyFilter from "./dialog/DialogCompanyFilter.jsx";
import { dictToURI } from "../utils/url.jsx";
import CompanyMap from "./map/CompanyMap.jsx";

export default class PageCompany extends React.Component {
	constructor(props) {
		super(props);

		this.refreshCompanies = this.refreshCompanies.bind(this);
		this.addCompany = this.addCompany.bind(this);
		this.export = this.export.bind(this);

		this.state = {
			companies: null,
			newCompanyName: null,
			filters: null,
			filtered_companies_only: true,
			include_address: false,
			include_email: false,
			include_phone: false,
			include_taxonomy: false,
			include_workforce: false,

			showMap: false,
		};
	}

	componentDidMount() {
		this.refreshCompanies();
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.filters !== this.state.filters) this.refreshCompanies();
	}

	refreshCompanies() {
		this.setState({
			companies: null,
			loading: true,
		});

		const params = dictToURI(this.state.filters);

		getRequest.call(this, "company/get_companies?" + params, (data) => {
			this.setState({
				companies: data.sort((a, b) => (a.name > b.name ? 1 : -1)),
				loading: false,
			});
		}, (response) => {
			this.setState({ loading: false });
			nm.warning(response.statusText);
		}, (error) => {
			this.setState({ loading: false });
			nm.error(error.message);
		});
	}

	addCompany() {
		const params = {
			name: this.state.newCompanyName,
		};

		postRequest.call(this, "company/add_company", params, () => {
			this.refreshCompanies();
			this.setState({ newCompanyName: null });
			nm.info("The company has been added");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	export() {
		nm.info("The download will start soon...");

		let params = {
			include_address: this.state.include_address,
			include_email: this.state.include_email,
			include_phone: this.state.include_phone,
			include_taxonomy: this.state.include_taxonomy,
			include_workforce: this.state.include_workforce,
		};

		if (this.state.filtered_companies_only) params = { ...params, ...this.state.filters };

		getBlobRequest.call(this, "company/extract_companies?" + dictToURI(params), (blob) => {
			const url = window.URL.createObjectURL(new Blob([blob]));
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", "CYBERLUX - Company export.xlsx");
			document.body.appendChild(link);
			link.click();
			link.parentNode.removeChild(link);
		}, (response) => {
			this.setState({ loading: false });
			nm.warning(response.statusText);
		}, (error) => {
			this.setState({ loading: false });
			nm.error(error.message);
		});
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		if (this.state.showMap) {
			return <CompanyMap
				onClose={() => this.setState({ showMap: false })}
			/>;
		}

		const columns = [
			{
				Header: "Name",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<Company
						id={value.id}
						name={value.name}
						afterDeletion={() => this.refreshCompanies()}
						onOpen={() => this.props.history.push("/companies/" + value.id)}
						onClose={() => this.props.history.push("/companies")}
						open={value.id.toString() === this.props.match.params.id}
					/>
				),
			},
			{
				Header: "RSCL Number",
				accessor: "rscl_number",
			},
			{
				Header: "Website",
				accessor: "website",
				Cell: ({ cell: { value } }) => (
					<Website
						url={value}
					/>
				),
			},
		];

		return (
			<div id="PageCompany" className="page max-sized-page">
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>{this.state.companies !== null
							? this.state.companies.length : 0} Compan{this.state.companies !== null
								&& this.state.companies.length > 1 ? "ies" : "y"}</h1>
						<div className="top-right-buttons">
							<button
								onClick={() => this.setState({ showMap: true })}>
								<i className="fas fa-map-marked-alt"/>
							</button>
							<button
								onClick={() => this.refreshCompanies()}>
								<i className="fas fa-redo-alt"/>
							</button>
							<DialogCompanyFilter
								trigger={
									<button
										className={"blue-background"}
										data-hover="Filter">
										<span><i className="fas fa-search"/></span>
									</button>
								}
								applyFilter={(filters) => this.changeState("filters", filters)}
							/>
						</div>
					</div>
					<div className="col-md-12 PageCompany-table">
						{this.state.companies !== null
							? <div className="fade-in">
								<Table
									columns={columns}
									data={this.state.companies
										.filter((c) => this.props.match.params.id === undefined
											|| this.props.match.params.id === c.id.toString())}
									showBottomBar={true}
								/>
							</div>
							:							<Loading
								height={500}
							/>
						}
					</div>
				</div>
				<div className={"row row-spaced"}>
					<div className="col-md-6">
						<h1>Add a new company</h1>
						<FormLine
							label={"Name"}
							value={this.state.newCompanyName}
							onChange={(v) => this.changeState("newCompanyName", v)}
						/>
						<div className="right-buttons">
							<button
								onClick={() => this.addCompany()}
								disabled={this.state.newCompanyName === null
									|| this.state.newCompanyName.length < 3}>
								<i className="fas fa-plus"/> Add a new company
							</button>
						</div>
					</div>
					<div className="col-md-6">
						<h1>Export into XLSX</h1>
						<FormLine
							label={"Get filtered companies only"}
							type={"checkbox"}
							value={this.state.filtered_companies_only}
							onChange={(v) => this.changeState("filtered_companies_only", v)}
						/>
						<FormLine
							label={"Include emails"}
							type={"checkbox"}
							value={this.state.include_email}
							onChange={(v) => this.changeState("include_email", v)}
						/>
						<FormLine
							label={"Include phone numbers"}
							type={"checkbox"}
							value={this.state.include_phone}
							onChange={(v) => this.changeState("include_phone", v)}
						/>
						<FormLine
							label={"Include addresses"}
							type={"checkbox"}
							value={this.state.include_address}
							onChange={(v) => this.changeState("include_address", v)}
						/>
						<FormLine
							label={"Include taxonomy"}
							type={"checkbox"}
							value={this.state.include_taxonomy}
							onChange={(v) => this.changeState("include_taxonomy", v)}
						/>
						<FormLine
							label={"Include workforce"}
							type={"checkbox"}
							value={this.state.include_workforce}
							onChange={(v) => this.changeState("include_workforce", v)}
						/>
						<div className="right-buttons">
							<button
								onClick={this.export}>
								<i className="far fa-file-excel"/> Export
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
