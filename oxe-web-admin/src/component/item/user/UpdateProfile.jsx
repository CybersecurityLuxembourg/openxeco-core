import React from "react";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";
import Loading from "../../box/Loading.jsx";
import { validateNotNull } from "../../../utils/re.jsx";

export default class UpdateProfile extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			profile: {
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
				public: false,
				user_id: null,
			},

			selected_domains: [],

			expertise: [],
			industries: [],
			countries: [],
			professions: [],
			domains: [],
		};
	}

	componentDidMount() {
		this.setState({
			profile: this.props.userProfile,
			selected_domains: this.props.userProfile.domains_of_interest.split(" | "),
		});

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

	changeProfileState(field, value) {
		const tempProfile = this.state.profile;
		tempProfile[field] = value;
		this.changeState("profile", tempProfile);
		this.props.setProfileValues(this.state.profile);
	}

	setRole(value) {
		this.changeProfileState("profession_id", value);
		const role = this.state.professions.find(
			(p) => (p.id === value),
		);
		if (role !== undefined && (role.name === "Student" || role.name === "Retired")) {
			this.changeProfileState("sector", null);
			this.changeProfileState("industry_id", null);
		}
		this.forceUpdate();
	}

	isStudentOrRetired() {
		const role = this.state.professions.find(
			(p) => (p.id === this.state.profession_id),
		);
		if (role === undefined) {
			return false;
		}
		return role.name === "Student" || role.name === "Retired";
	}

	agreedToAll() {
		return this.state.agree_code && this.state.agree_privacy;
	}

	setDomains(name, value) {
		let domains = [];
		if (this.state.profile.domains_of_interest !== null) {
			domains = this.state.profile.domains_of_interest.split(" | ");
		}
		if (value === true && domains.includes(name) === false) {
			domains.push(name);
		}
		if (value === false && domains.includes(name) === true) {
			const index = domains.indexOf(name);
			if (index > -1) {
				domains.splice(index, 1);
			}
		}
		this.changeState("selected_domains", domains);
		this.changeProfileState("domains_of_interest", domains.length > 0 ? domains.join(" | ") : null);
	}

	render() {
		return (
			<div>
				<FormLine
					label="Name *"
					value={this.state.profile.first_name}
					onBlur={(v) => this.changeProfileState("first_name", v)}
					autofocus={true}
					onKeyDown={this.onKeyDown}
				/>
				<FormLine
					label="Surname *"

					value={this.state.profile.last_name}
					onBlur={(v) => this.changeProfileState("last_name", v)}
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

					value={this.state.profile.gender}
					onChange={(v) => this.changeProfileState("gender", v)}
					onKeyDown={this.onKeyDown}
					format={validateNotNull}
				/>
				<FormLine
					label="Telephone Number"

					value={this.state.profile.telephone}
					onBlur={(v) => this.changeProfileState("telephone", v)}
					onKeyDown={this.onKeyDown}
				/>
				<FormLine
					label="Mobile Number"

					value={this.state.profile.mobile}
					onBlur={(v) => this.changeProfileState("mobile", v)}
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

					value={this.state.profile.profession_id}
					onChange={(v) => this.setRole(v)}
					onKeyDown={this.onKeyDown}
					format={validateNotNull}
				/>
				<FormLine
					label="Sector *"
					type="select"
					options={[
						{ value: null, label: "-" },
						{ value: "Private", label: "Private" },
						{ value: "Public", label: "Public" },
					]}

					value={this.state.profile.sector}
					onChange={(v) => this.changeProfileState("sector", v)}
					onKeyDown={this.onKeyDown}
					disabled={this.isStudentOrRetired()}
					format={validateNotNull}
				/>
				<FormLine
					label="Industry *"
					type="select"
					options={[{ value: null, label: "-" }].concat(
						this.state.industries.map((o) => ({ label: o.name, value: o.id })),
					)}

					value={this.state.profile.industry_id}
					onChange={(v) => this.changeProfileState("industry_id", v)}
					onKeyDown={this.onKeyDown}
					disabled={this.isStudentOrRetired()}
					format={validateNotNull}
				/>
				<FormLine
					label="Nationality *"
					type="select"
					options={[{ value: null, label: "-" }].concat(
						this.state.countries.map((o) => ({ label: o.name, value: o.id })),
					)}

					value={this.state.profile.nationality_id}
					onChange={(v) => this.changeProfileState("nationality_id", v)}
					onKeyDown={this.onKeyDown}
					format={validateNotNull}
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

					value={this.state.profile.residency}
					onChange={(v) => this.changeProfileState("residency", v)}
					onKeyDown={this.onKeyDown}
					format={validateNotNull}
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

					value={this.state.profile.experience}
					onChange={(v) => this.changeProfileState("experience", v)}
					onKeyDown={this.onKeyDown}
					format={validateNotNull}
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

					value={this.state.profile.expertise_id}
					onChange={(v) => this.changeProfileState("expertise_id", v)}
					onKeyDown={this.onKeyDown}
					format={validateNotNull}
				/>
				<div className="FormLine-label font-weight-bold">Domains of interest *</div>
				{this.state.domains !== null
					? this.state.domains
						.map((c) => (
							<FormLine
								key={c.id}
								label={c.name}
								type={"checkbox"}
								value={this.state.selected_domains.includes(c.name)}
								onChange={(v) => this.setDomains(c.name, v)}
							/>
						))
					: <Loading
						height={200}
					/>
				}
			</div>
		);
	}
}
