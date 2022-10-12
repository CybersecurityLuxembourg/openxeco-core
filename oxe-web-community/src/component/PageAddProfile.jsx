import React from "react";
import "./PageAddProfile.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../utils/request.jsx";
import FormLine from "./form/FormLine.jsx";
import Loading from "./box/Loading.jsx";

export default class PageAddProfile extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			first_name: "",
			last_name: "",
			telephone: "",
			domains_of_interest: null,
			experience: null,
			expertise_id: null,
			gender: null,
			how_heard: null,
			industry_id: null,
			mobile: "",
			nationality_id: null,
			profession_id: null,
			residency: null,
			sector: null,
			user_id: null,
			expertise: [],
			industries: [],
			countries: [],
			professions: [],
			domains: [],
			affiliated: false,
		};
	}

	componentDidMount() {
		getRequest.call(this, "public/get_public_countries", (data) => {
			this.setState({
				countries: data,
			});
		}, (error) => {
			nm.warning(error.message);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "public/get_public_professions", (data) => {
			this.setState({
				professions: data,
			});
		}, (error) => {
			nm.warning(error.message);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "public/get_public_industries", (data) => {
			this.setState({
				industries: data,
			});
		}, (error) => {
			nm.warning(error.message);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "public/get_public_domains", (data) => {
			this.setState({
				domains: data,
			});
		}, (error) => {
			nm.warning(error.message);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "public/get_public_expertise", (data) => {
			this.setState({
				expertise: data,
			});
		}, (error) => {
			nm.warning(error.message);
		}, (error) => {
			nm.error(error.message);
		});
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	isFormValid() {
		const malta = this.state.countries.find(
			(country) => (country.name === "Malta"),
		);
		if (malta === undefined
			|| this.state.first_name === ""
			|| this.state.last_name === ""
			|| this.state.domains_of_interest === null
			|| this.state.experience === null
			|| this.state.expertise_id === null
			|| this.state.gender === null
			|| this.state.how_heard === null
			|| this.state.nationality_id === null
			|| this.state.profession_id === null
			|| this.state.residency === null
			|| (
				this.isStudent() === false
				&& this.sector === null
				&& this.industry_id === null
			)
		) {
			return false;
		}
		if (this.state.nationality_id === malta.id || this.state.residency === "Malta") {
			return true;
		}
		return false;
	}

	setRole(value) {
		this.changeState("profession_id", value);
		if (this.isStudent() === true) {
			this.changeState("sector", null);
			this.changeState("industry_id", null);
		}
	}

	isStudent() {
		const role = this.state.professions.find(
			(profession) => (profession.name === "Student"),
		);
		if (role === undefined) {
			return false;
		}
		return this.state.profession_id === role.id;
	}

	setDomains(name, value) {
		let domains = [];
		if (this.state.domains_of_interest !== null) {
			domains = this.state.domains_of_interest.split(" | ");
		}
		if (value === true && domains.includes(name) === false) {
			domains.push(name);
		}
		if (value === false && domains.includes(name) === true) {
			const index = domains.indexOf(name);
			console.log(index);
			if (index > -1) {
				domains.splice(index, 1);
			}
		}
		this.changeState("domains_of_interest", domains.length > 0 ? domains.join(" | ") : null);
	}

	submitCreationRequest() {
		const params = {
			type: "NEW INDIVIDUAL ACCOUNT",
			request: "The user requests the creation of their profile",
			data: {
				first_name: this.state.first_name,
				last_name: this.state.last_name,
				telephone: this.state.telephone,
				domains_of_interest: this.state.domains_of_interest,
				experience: this.state.experience,
				expertise_id: this.state.expertise_id,
				gender: this.state.gender,
				how_heard: this.state.how_heard,
				industry_id: this.state.industry_id,
				mobile: this.state.mobile,
				nationality_id: this.state.nationality_id,
				profession_id: this.state.profession_id,
				residency: this.state.residency,
				sector: this.state.sector,
			},
		};
		postRequest.call(this, "private/add_request", params, () => {
			nm.info("The request has been sent and will be reviewed");
			this.fetchUser();
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	fetchUser() {
		getRequest.call(this, "private/get_my_user", (data) => {
			this.props.setUserStatus(data.status);
		}, (response2) => {
			nm.warning(response2.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	render() {
		return (
			<div id="PageAddProfile" className="page max-sized-page">
				<h1>Create your profile</h1>
				<div className="row">
					<div className="col-md-6">
						<FormLine
							label="Name *"
							fullWidth={true}
							value={this.state.first_name}
							onChange={(v) => this.changeState("first_name", v)}
							autofocus={true}
							onKeyDown={this.onKeyDown}
						/>
						<FormLine
							label="Surname *"
							fullWidth={true}
							value={this.state.last_name}
							onChange={(v) => this.changeState("last_name", v)}
							autofocus={true}
							onKeyDown={this.onKeyDown}
						/>
						<FormLine
							label="Gender *"
							type="select"
							options={[
								{ value: null, label: "-" },
								{ value: "Male", label: "Male" },
								{ value: "Female", label: "Female" },
								{ value: "Non-binary", label: "Non-binary" },
								{ value: "Other", label: "Other" },
								{ value: "Prefer not to say", label: "Prefer not to say" },
							]}
							fullWidth={true}
							value={this.state.gender}
							onChange={(v) => this.changeState("gender", v)}
							autofocus={true}
							onKeyDown={this.onKeyDown}
						/>
						<FormLine
							label="Telephone Number"
							fullWidth={true}
							value={this.state.telephone}
							onChange={(v) => this.changeState("telephone", v)}
							autofocus={true}
							onKeyDown={this.onKeyDown}
						/>
						<FormLine
							label="Mobile Number"
							fullWidth={true}
							value={this.state.mobile}
							onChange={(v) => this.changeState("mobile", v)}
							autofocus={true}
							onKeyDown={this.onKeyDown}
						/>
						<FormLine
							label="Role/Profession *"
							type="select"
							options={[{ value: null, label: "-" }].concat(
								this.state.professions.map((o) => ({
									label: (
										<>
											<div title={o.description}>{o.name}</div>
										</>
									),
									value: o.id,
								})),
							)}
							fullWidth={true}
							value={this.state.profession_id}
							onChange={(v) => this.setRole(v)}
							autofocus={true}
							onKeyDown={this.onKeyDown}
						/>
						<FormLine
							label="Sector *"
							type="select"
							options={[
								{ value: null, label: "-" },
								{ value: "Private", label: "Private" },
								{ value: "Public", label: "Public" },
							]}
							fullWidth={true}
							value={this.state.sector}
							onChange={(v) => this.changeState("sector", v)}
							autofocus={true}
							onKeyDown={this.onKeyDown}
							disabled={this.isStudent()}
						/>
						<FormLine
							label="Industry *"
							type="select"
							options={[{ value: null, label: "-" }].concat(
								this.state.industries.map((o) => ({ label: o.name, value: o.id })),
							)}
							fullWidth={true}
							value={this.state.industry_id}
							onChange={(v) => this.changeState("industry_id", v)}
							autofocus={true}
							onKeyDown={this.onKeyDown}
							disabled={this.isStudent()}
						/>
						<FormLine
							label="Nationality *"
							type="select"
							options={[{ value: null, label: "-" }].concat(
								this.state.countries.map((o) => ({ label: o.name, value: o.id })),
							)}
							fullWidth={true}
							value={this.state.nationality_id}
							onChange={(v) => this.changeState("nationality_id", v)}
							autofocus={true}
							onKeyDown={this.onKeyDown}
						/>
						<FormLine
							label="Residency (Location) *"
							type="select"
							options={[
								{ value: null, label: "-" },
								{ value: "Malta", label: "Malta" },
								{ value: "Gozo", label: "Gozo" },
								{ value: "Outside of Malta", label: "Outside of Malta" },
							]}
							fullWidth={true}
							value={this.state.residency}
							onChange={(v) => this.changeState("residency", v)}
							autofocus={true}
							onKeyDown={this.onKeyDown}
						/>
						<FormLine
							label="Years of professional experience in/related to cybersecurity *"
							type="select"
							options={[
								{ value: null, label: "-" },
								{ value: "Student", label: "Student" },
								{ value: "0 - 2", label: "0 - 2" },
								{ value: "2 - 5", label: "2 - 5" },
								{ value: "5 - 10", label: "5 - 10" },
								{ value: "10+", label: "10+" },
							]}
							fullWidth={true}
							value={this.state.experience}
							onChange={(v) => this.changeState("experience", v)}
							autofocus={true}
							onKeyDown={this.onKeyDown}
						/>
						<FormLine
							label="Primary area of expertise in/related to cybersecurity *"
							type="select"
							options={[{ value: null, label: "-" }].concat(
								this.state.expertise.map((o) => ({
									label: (
										<>
											<div title={o.description}>{o.name}</div>
										</>
									),
									value: o.id,
								})),
							)}
							fullWidth={true}
							value={this.state.expertise_id}
							onChange={(v) => this.changeState("expertise_id", v)}
							autofocus={true}
							onKeyDown={this.onKeyDown}
						/>
					</div>
					<div className="col-md-6">
						<FormLine
							label="How did you hear about the Community *"
							type="select"
							options={[
								{ value: null, label: "-" },
								{ value: "Social Media", label: "Social Media" },
								{ value: "TV Advert", label: "TV Advert" },
								{ value: "Friend/Colleague", label: "Friend/Colleague" },
								{ value: "Government Website", label: "Government Website" },
								{ value: "European Commission", label: "European Commission" },
								{ value: "Other", label: "Other" },
							]}
							fullWidth={true}
							value={this.state.how_heard}
							onChange={(v) => this.changeState("how_heard", v)}
							autofocus={true}
							onKeyDown={this.onKeyDown}
						/>
						<div className="FormLine-label">Domains of interest *</div>
						{this.state.domains !== null
							? this.state.domains
								.map((c) => (
									<FormLine
										key={c.id}
										label={c.name}
										type={"checkbox"}
										value={false}
										onChange={(v) => this.setDomains(c.name, v)}
									/>
								))
							: <Loading
								height={200}
							/>
						}
						<div style={{ height: 50 }}></div>
						<FormLine
							label={"Affiliated with an entity? *"}
							type={"checkbox"}
							value={this.state.affiliated}
							onChange={(v) => this.changeState("affiliated", v)}
						/>
					</div>
				</div>

				<div className="row">
					<div className="col-md-12">
						<div className="right-buttons">
							<button
								className={"blue-background"}
								onClick={() => this.submitCreationRequest()}
								disabled={
									!this.isFormValid()
								}
							>
								Save my profile
							</button>
						</div>
					</div>
				</div>
			</div>

		);
	}
}
