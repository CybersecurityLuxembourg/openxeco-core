import React from "react";
import "./CompanyGlobal.css";
import { NotificationManager as nm } from "react-notifications";
import _ from "lodash";
import FormLine from "../form/FormLine.jsx";
import { postRequest } from "../../utils/request.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import Loading from "../box/Loading.jsx";

export default class CompanyGlobal extends React.Component {
	constructor(props) {
		super(props);

		this.submitModificationRequests = this.submitModificationRequests.bind(this);

		this.state = {
			companyInfo: props.company,

			fields: {
				name: "Name",
				type: "Type",
				description: "Description",
				rscl_number: "RCSL number",
				website: "Website",
				creation_date: "Creation date",
				is_cybersecurity_core_business: "Is cybersecurity core business",
				is_startup: "Is startup",
				is_targeting_sme: "Is targeting SMEs",
			},
		};
	}

	componentDidUpdate(prevState, prevProps) {
		if (prevProps.company === null
			&& this.props.company !== null
			&& this.state.companyInfo === null) {
			this.setState({
				companyInfo: this.props.company,
			});
		}
	}

	submitModificationRequests() {
		const params = {
			type: "ENTITY CHANGE",
			request: "The user requests modifications on an entity",
			company_id: this.props.company.id,
			data: this.state.companyInfo,
		};

		postRequest.call(this, "private/add_request", params, () => {
			this.props.getNotifications();
			nm.info("The request has been sent and will be reviewed");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getModifiedFields(c1, c2) {
		const fields = [];

		Object.entries(c1).forEach(([key]) => {
			if (c1[key] !== c2[key]) fields.push(this.state.fields[key]);
		});

		return fields.join(", ");
	}

	updateCompany(field, value) {
		const c = JSON.parse(JSON.stringify(this.state.companyInfo));
		c[field] = value;
		this.setState({ companyInfo: c });
	}

	render() {
		if (this.state.companyInfo === null
			|| this.state.companyInfo === undefined) {
			return <Loading
				height={300}
			/>;
		}

		return (
			<div id="CompanyGlobal" className="max-sized-page fade-in">
				<div className={"row row-spaced"}>
					<div className="col-md-12 row-spaced">
						<h2>Global information</h2>
					</div>

					<div className="col-md-12">
						<FormLine
							label={this.state.fields.name}
							value={this.state.companyInfo.name}
							onChange={(v) => this.updateCompany("name", v)}
						/>
						<FormLine
							label={this.state.fields.description}
							type={"textarea"}
							value={this.state.companyInfo.description}
							onChange={(v) => this.updateCompany("description", v)}
						/>
						<FormLine
							label={this.state.fields.rscl_number}
							value={this.state.companyInfo.rscl_number}
							onChange={(v) => this.updateCompany("rscl_number", v)}
						/>
						<FormLine
							label={this.state.fields.website}
							value={this.state.companyInfo.website}
							onChange={(v) => this.updateCompany("website", v)}
						/>
						<FormLine
							label={this.state.fields.creation_date}
							type={"date"}
							value={this.state.companyInfo.creation_date}
							onChange={(v) => this.updateCompany("creation_date", v)}
						/>
						<FormLine
							label={this.state.fields.is_cybersecurity_core_business}
							type={"checkbox"}
							value={this.state.companyInfo.is_cybersecurity_core_business}
							onChange={(v) => this.updateCompany("is_cybersecurity_core_business", v)}
							background={false}
						/>
						<FormLine
							label={this.state.fields.is_startup}
							type={"checkbox"}
							value={this.state.companyInfo.is_startup}
							onChange={(v) => this.updateCompany("is_startup", v)}
							background={false}
						/>
						<FormLine
							label={this.state.fields.is_targeting_sme}
							type={"checkbox"}
							value={this.state.companyInfo.is_targeting_sme}
							onChange={(v) => this.updateCompany("is_targeting_sme", v)}
							background={false}
						/>

						<div className={"right-buttons"}>
							<DialogConfirmation
								text={"Do you want to request modifications for those fields : "
									+ this.getModifiedFields(this.state.companyInfo, this.props.company) + " ?"}
								trigger={
									<button
										className={"blue-background"}
										disabled={_.isEqual(this.state.companyInfo, this.props.company)}
									>
										<i className="fas fa-save"/> Request modifications...
									</button>
								}
								afterConfirmation={() => this.submitModificationRequests()}
							/>
							<button
								className={"blue-background"}
								disabled={_.isEqual(this.state.companyInfo, this.props.company)}
								onClick={() => this.setState({ companyInfo: this.props.company })}
							>
								<i className="fas fa-undo-alt"/>
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
