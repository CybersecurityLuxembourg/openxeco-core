import React from "react";
import "./EntityExport.css";
import { NotificationManager as nm } from "react-notifications";
import { getBlobRequest } from "../../utils/request.jsx";
import FormLine from "../button/FormLine.jsx";
import { dictToURI } from "../../utils/url.jsx";
import { dateToString } from "../../utils/date.jsx";
import DialogEntityFilter from "../dialog/DialogEntityFilter.jsx";

export default class EntityExport extends React.Component {
	constructor(props) {
		super(props);

		this.export = this.export.bind(this);

		this.state = {
			filtered_entities_only: true,
			include_user: false,
			include_address: false,
			include_email: false,
			include_phone: false,
			include_taxonomy: false,
			include_workforce: false,
			include_authorisation_by_approved_signatory: false,
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
			include_authorisation_by_approved_signatory: this.state.include_authorisation_by_approved_signatory,
		};

		if (this.state.filtered_entities_only) params = { ...params, ...this.props.filters };

		getBlobRequest.call(this, "entity/extract_entities?" + dictToURI(params), (blob) => {
			const url = window.URL.createObjectURL(new Blob([blob]));
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", "Export - entities - " + dateToString(new Date()) + ".xlsx");
			document.body.appendChild(link);
			link.click();
			link.parentNode.removeChild(link);
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
		return (
			<div id="EntityExport">
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

					<div className="col-md-12">
						<h2>Export into XLSX</h2>

						<FormLine
							label={"Get filtered entities only"}
							type={"checkbox"}
							value={this.state.filtered_entities_only}
							onChange={(v) => this.changeState("filtered_entities_only", v)}
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
						<FormLine
							label={"Include authorisation by approved signatory"}
							type={"checkbox"}
							value={this.state.include_authorisation_by_approved_signatory}
							onChange={(v) => this.changeState("include_authorisation_by_approved_signatory", v)}
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
