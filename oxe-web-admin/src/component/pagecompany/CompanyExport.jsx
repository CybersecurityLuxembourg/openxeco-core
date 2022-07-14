import React from "react";
import "./CompanyExport.css";
import { NotificationManager as nm } from "react-notifications";
import { getBlobRequest } from "../../utils/request.jsx";
import FormLine from "../button/FormLine.jsx";
import { dictToURI } from "../../utils/url.jsx";
import DialogCompanyFilter from "../dialog/DialogCompanyFilter.jsx";

export default class CompanyExport extends React.Component {
	constructor(props) {
		super(props);

		this.export = this.export.bind(this);

		this.state = {
			filtered_companies_only: true,
			include_user: false,
			include_address: false,
			include_email: false,
			include_phone: false,
			include_taxonomy: false,
			include_workforce: false,
		};
	}

	export() {
		nm.info("The download will start soon...");

		let params = {
			include_user: this.state.include_user,
			include_address: this.state.include_address,
			include_email: this.state.include_email,
			include_phone: this.state.include_phone,
			include_taxonomy: this.state.include_taxonomy,
			include_workforce: this.state.include_workforce,
		};

		if (this.state.filtered_companies_only) params = { ...params, ...this.props.filters };

		getBlobRequest.call(this, "company/extract_companies?" + dictToURI(params), (blob) => {
			const url = window.URL.createObjectURL(new Blob([blob]));
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", "Company export.xlsx");
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
		return (
			<div id="CompanyExport">
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>Export into XLSX</h1>

						<div className="top-right-buttons">
							<button
								onClick={() => this.props.refreshCompanies()}>
								<i className="fas fa-redo-alt"/>
							</button>
							<DialogCompanyFilter
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

					<div className="col-md-12">
						<FormLine
							label={"Get filtered entities only"}
							type={"checkbox"}
							value={this.state.filtered_companies_only}
							onChange={(v) => this.changeState("filtered_companies_only", v)}
						/>
						<FormLine
							label={"Include users"}
							type={"checkbox"}
							value={this.state.include_user}
							onChange={(v) => this.changeState("include_user", v)}
						/>
						<FormLine
							label={"Include contact emails"}
							type={"checkbox"}
							value={this.state.include_email}
							onChange={(v) => this.changeState("include_email", v)}
						/>
						<FormLine
							label={"Include contact phone numbers"}
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
