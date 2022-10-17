import React from "react";
import "./AddEntityRegister.css";
import { Link } from "react-router-dom";
import { NotificationManager as nm } from "react-notifications";
import Dropzone from "react-dropzone";
import { getRequest, postRequest } from "../../utils/request.jsx";
import FormLine from "../form/FormLine.jsx";
import Info from "../box/Info.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import DialogHint from "../dialog/DialogHint.jsx";
import Loading from "../box/Loading.jsx";
import {
	validateEmail,
	validateTelephoneNumber,
	validateVatNumber,
	validateWebsite,
	validatePostcode,
} from "../../utils/re.jsx";

export default class AddEntityRegister extends React.Component {
	constructor(props) {
		super(props);

		this.onDropForm = this.onDropForm.bind(this);
		this.state = {
			name: "",
			address_1: "",
			address_2: "",
			postal_code: "",
			country: "Malta",
			city: "",
			entity_type: "",
			vat_number: "",
			website: "",
			company_email: "",
			size: "",
			sector: "",
			industry: "",
			involvement: "",
			primary_contact_name: "",
			work_telephone: "",
			seniority_level: "",
			department: "",
			uploaded_file: null,
			acknowledge: false,
			departments: [],
			involvements: [],
			locations: [],
			sectors: [],
			industries: null,
		};
	}

	componentDidMount() {
		getRequest.call(this, "private/get_my_user", (data) => {
			this.setState({ primary_contact_name: data.first_name + " " + data.last_name });
		}, (response2) => {
			nm.warning(response2.statusText);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "public/get_public_departments", (data) => {
			this.setState({
				departments: data,
			});
		}, (error) => {
			nm.warning(error.message);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "public/get_public_involvement", (data) => {
			this.setState({
				involvements: data,
			});
		}, (error) => {
			nm.warning(error.message);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "public/get_public_locations", (data) => {
			this.setState({
				locations: data,
			});
		}, (error) => {
			nm.warning(error.message);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "public/get_public_sectors", (data) => {
			this.setState({
				sectors: data,
			});
		}, (error) => {
			nm.warning(error.message);
		}, (error) => {
			nm.error(error.message);
		});
	}

	submitCreationRequest() {
		const reader = new FileReader();
		reader.onabort = () => nm.error("file reading was aborted");
		reader.onerror = () => nm.error("An error happened while reading the file");
		reader.onload = () => {
			const params = {
				type: "ENTITY ADD",
				request: "The user requests the creation of an entity",
				data: {
					name: this.state.name,
					address_1: this.state.address_1,
					address_2: this.state.address_2,
					postal_code: this.state.postal_code,
					city: this.state.city,
					country: "Malta",
					entity_type: this.state.entity_type,
					vat_number: this.state.vat_number,
					website: this.state.website,
					company_email: this.state.company_email,
					size: this.state.size,
					sector: this.state.sector,
					industry: this.state.industry,
					involvement: this.state.involvement,
					primary_contact_name: this.state.primary_contact_name,
					work_telephone: this.state.work_telephone,
					seniority_level: this.state.seniority_level,
					department: this.state.department,
					acknowledge: this.state.acknowledge,
				},
				uploaded_file: reader.result,
			};
			postRequest.call(this, "private/add_request", params, () => {
				this.props.getNotifications();
				nm.info("The request has been sent and will be reviewed");
				this.props.changeMenu("/");
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		};
		reader.readAsDataURL(this.state.uploaded_file);
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	setIndustries(name) {
		const sector = this.state.sectors.find(
			(s) => (s.name === name),
		);
		const sectorIndustries = sector.industries.split("|");
		this.changeState("sector", sector.name);
		this.changeState("industries", sectorIndustries);
	}

	onDropForm(files) {
		if (files.length > 0) {
			this.setState({ uploaded_file: files[0] });
		}
	}

	formValid() {
		if (this.state.name === ""
			|| this.state.city === ""
			|| !validatePostcode(this.state.postal_code)
			|| this.state.address_1 === ""
			|| this.state.entity_type === ""
			|| !validateVatNumber(this.state.vat_number)
			|| (this.state.website !== "" && !validateWebsite(this.state.website))
			|| (this.state.company_email !== "" && !validateEmail(this.state.company_email))
			|| this.state.size === ""
			|| this.state.sector === ""
			|| this.state.industry === ""
			|| this.state.involvement === ""
			|| (this.state.work_telephone !== ""
				&& !validateTelephoneNumber(this.state.work_telephone)
			)
			|| this.state.level === ""
			|| this.state.department === ""
			|| this.state.uploaded_file === null
			|| this.state.acknowledge === false
		) {
			return false;
		}
		return true;
	}

	static isFieldCompleted(v) {
		return v !== undefined && v.length > 0;
	}

	render() {
		return (
			<div id="AddEntityRegister" className="max-sized-page row-spaced">
				<div className={"row row-spaced"}>
					<div className="col-md-9">
						<h2>Register an entity</h2>
					</div>

					<div className="col-md-3 top-title-menu">
						<DialogHint
							content={
								<div className="row">
									<div className="col-md-12">
										<h2>How to register a new entity?</h2>

										<p>
											Fill in the form and select the
											&quot;Request registration&quot; button.
										</p>

										<img src="/img/hint-request-registration-button.png"/>

										<p>
											Note that the Name, Website and Creation date fields
											are mandatory to complete the form.
										</p>

										<h2>Note</h2>

										<p>
											You can follow up your requests by clicking on the
											icon in the left menu bar as shown below:
										</p>

										<img src="/img/hint-contact-menu.png"/>
									</div>
								</div>
							}
						/>
					</div>

					<div className="col-md-12 row-spaced">
						<Info
							content={
								<div>
									You can register your entity here.
									Please fill in the form only if you haven&apos;t
									found your entity in
									the <Link to="/add_entity?tab=claim">Claim an entity</Link> tab.
								</div>
							}
						/>
						<FormLine
							label={"Have you checked if the entity is in the database?"}
							type="checkbox"
							value={this.state.notFoundEntity}
							onChange={(v) => this.changeState("notFoundEntity", v)}
							background={false}
						/>
					</div>

					<div className="col-md-12">
						<FormLine
							label={"Full Legal Name *"}
							value={this.state.name}
							onChange={(v) => this.changeState("name", v)}
							disabled={!this.state.notFoundEntity}
						/>
						<FormLine
							label={"Registered Address Line 1 *"}
							value={this.state.address_1}
							onChange={(v) => this.changeState("address_1", v)}
							disabled={!this.state.notFoundEntity}
						/>
						<FormLine
							label={"Registered Address Line 2"}
							value={this.state.address_2}
							onChange={(v) => this.changeState("address_2", v)}
							disabled={!this.state.notFoundEntity}
						/>
						<FormLine
							label={"Registered Address Post Code *"}
							value={this.state.postal_code}
							onChange={(v) => this.changeState("postal_code", v)}
							disabled={!this.state.notFoundEntity}
						/>
						{ !validatePostcode(this.state.postal_code) && this.state.postal_code !== ""
							&& <div className="row">
								<div className="col-md-6"></div>
								<div className="col-md-6">
									<div className="validation-error">
										Accepted Format: ABC 1234
									</div>
								</div>
							</div>
						}
						{this.state.locations
							? <FormLine
								label={"Registered Address City *"}
								type={"select"}
								options={this.state.locations
									? this.state.locations
										.map((d) => ({ label: d.name, value: d.name }))
									: []
								}
								value={this.state.city}
								onChange={(v) => this.setState({ city: v })}
								disabled={!this.state.notFoundEntity}
							/>
							: <Loading
								height={200}
							/>
						}
						<FormLine
							label={"Registered Address Country"}
							value={this.state.country}
							disabled={true}
						/>
						<FormLine
							label={"Entity type *"}
							type={"select"}
							options={[
								{ value: null, label: "-" },
								{ value: "Sole Trader", label: "Sole Trader" },
								{ value: "Partnership", label: "Partnership" },
								{ value: "Cooperative", label: "Cooperative" },
								{ value: "Company", label: "Company" },
								{ value: "Non-profit organisation", label: "Non-profit organisation" },
							]}
							value={this.props.entity_type}
							onChange={(v) => this.setState({ entity_type: v })}
							disabled={!this.state.notFoundEntity}
						/>
						<FormLine
							label={"VAT Number *"}
							value={this.state.vat_number}
							onChange={(v) => this.changeState("vat_number", v)}
							disabled={!this.state.notFoundEntity}
						/>
						{ !validateVatNumber(this.state.vat_number) && this.state.vat_number !== ""
							&& <div className="row">
								<div className="col-md-6"></div>
								<div className="col-md-6">
									<div className="validation-error">
										Accepted Format: MT1234578
									</div>
								</div>
							</div>
						}
						<FormLine
							label={"Website"}
							value={this.state.website}
							onChange={(v) => this.changeState("website", v)}
							disabled={!this.state.notFoundEntity}
						/>
						{ !validateWebsite(this.state.website) && this.state.website !== ""
							&& <div className="row">
								<div className="col-md-6"></div>
								<div className="col-md-6">
									<div className="validation-error">
										Accepted Formats: something.com.mt, www.something.com.mt
									</div>
								</div>
							</div>
						}
						<FormLine
							label="Company Email *"
							value={this.state.company_email}
							onChange={(v) => this.changeState("company_email", v)}
							autofocus={true}
							onKeyDown={this.onKeyDown}
							disabled={!this.state.notFoundEntity}
						/>
						<FormLine
							label={"Size *"}
							type={"select"}
							options={[
								{ value: null, label: "-" },
								{ value: "Micro", label: "Micro" },
								{ value: "Small", label: "Small" },
								{ value: "Medium", label: "Medium" },
								{ value: "Large", label: "Large" },
							]}
							value={this.props.size}
							onChange={(v) => this.setState({ size: v })}
							disabled={!this.state.notFoundEntity}
						/>
						{this.state.sectors
							? <FormLine
								label={"Sector *"}
								type={"select"}
								options={this.state.sectors
									? this.state.sectors
										.map((d) => ({ label: d.name, value: d.name }))
									: []
								}
								value={this.state.sector}
								onChange={(v) => this.setIndustries(v)}
								disabled={!this.state.notFoundEntity}
							/>
							: <Loading
								height={200}
							/>
						}
						<FormLine
							label={"Industry *"}
							type={"select"}
							options={this.state.industries
								? this.state.industries
									.map((d) => ({ label: d, value: d }))
								: []
							}
							value={this.state.industry}
							onChange={(v) => this.setState({ industry: v })}
							disabled={!this.state.notFoundEntity || !this.state.industries}
						/>
						{this.state.involvements
							? <FormLine
								label={"Primary involvement of the organisation in/related to cybersecurity *"}
								type={"select"}
								options={[{ value: null, label: "-" }].concat(
									this.state.involvements.map((o) => ({
										label: (
											<>
												<div title={o.description}>{o.name}</div>
											</>
										),
										value: o.name,
									})),
								)}
								value={this.state.involvement}
								onChange={(v) => this.setState({ involvement: v })}
								disabled={!this.state.notFoundEntity}
							/>
							: <Loading
								height={200}
							/>
						}
						<FormLine
							label="Primary Contact Name (auto populated)"
							value={this.state.primary_contact_name}
							autofocus={true}
							disabled={true}
						/>
						<FormLine
							label={"Seniority Level *"}
							type={"select"}
							options={[
								{ value: null, label: "-" },
								{ value: "Board Member", label: "Board Member" },
								{ value: "Executive Management", label: "Executive Management" },
								{ value: "Senior Management", label: "Senior Management" },
								{ value: "Management", label: "Management" },
								{ value: "Senior", label: "Senior" },
								{ value: "Intermediate", label: "Intermediate" },
								{ value: "Entry-Level", label: "Entry-Level" },
							]}
							value={this.state.seniority_level}
							onChange={(v) => this.setState({ seniority_level: v })}
							disabled={!this.state.notFoundEntity}
						/>
						{this.state.departments
							? <FormLine
								label={"Department *"}
								type={"select"}
								options={this.state.departments
									? this.state.departments
										.map((d) => ({ label: d.name, value: d.name }))
									: []
								}
								value={this.state.department}
								onChange={(v) => this.setState({ department: v })}
								disabled={!this.state.notFoundEntity}
							/>
							: <Loading
								height={200}
							/>
						}
						<FormLine
							label="Work Telephone Number *"
							value={this.state.work_telephone}
							onChange={(v) => this.changeState("work_telephone", v)}
							autofocus={true}
							onKeyDown={this.onKeyDown}
							disabled={!this.state.notFoundEntity}
						/>
						{ !validateTelephoneNumber(this.state.work_telephone) && this.state.work_telephone !== ""
							&& <div className="row">
								<div className="col-md-6"></div>
								<div className="col-md-6">
									<div className="validation-error">
										Accepted Format: +1234567891, 1234567891
									</div>
								</div>
							</div>
						}
						<div className="row">
							<div className="col-md-6">
								<div className="FormLine-label">
									Authorisation by Approved Signatory * <br />
									<span className="font-italic">(Upload the Entity Registration Approval form)</span>
								</div>
							</div>
							<div className="col-md-6">
								<Dropzone
									accept=".pdf"
									disabled={!this.state.notFoundEntity}
									onDrop={this.onDropForm}
									maxFiles={1}
								>
									{({ getRootProps, getInputProps }) => (
										<div
											className={this.state.uploaded_file === null ? "Upload-dragdrop" : "Upload-dragdrop-done"}
											{...getRootProps()}>
											<input {...getInputProps()} />
											<div className="Upload-dragdrop-textContent">
												{ this.state.uploaded_file === null
													? <div>
														Drag & drop the file here, or click to select the file
													</div>
													: <div>
														File: <span className="font-weight-bold">
															{ this.state.uploaded_file.name }
														</span>
													</div>
												}
											</div>
										</div>
									)}
								</Dropzone>
							</div>
						</div>
						<FormLine
							label={"I acknowledge that he information submitted about the entity may be made "
								+ "public on NCC platforms."}
							type="checkbox"
							value={this.state.acknowledge}
							onChange={(v) => this.changeState("acknowledge", v)}
							background={false}
						/>
						<div className={"right-buttons"}>
							<DialogConfirmation
								text={"Do you want to submit the entity creation as a request?"}
								trigger={
									<button
										className={"blue-background"}
										disabled={
											this.formValid() === false
										}
									>
										<i className="fas fa-save"/> Request registration
									</button>
								}
								afterConfirmation={() => this.submitCreationRequest()}
							/>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
