import React from "react";
import "./UserGlobal.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";
import Loading from "../../box/Loading.jsx";
import UpdateProfile from "./UpdateProfile.jsx";

export default class UserGlobal extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.saveUserValue = this.saveUserValue.bind(this);
		this.updateProfile = this.updateProfile.bind(this);
		this.setProfileValues = this.setProfileValues.bind(this);

		this.state = {
			user: null,
			userProfile: null,
		};
	}

	componentDidMount() {
		this.refresh();

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
	}

	refresh() {
		getRequest.call(this, "user/get_user/" + this.props.id, (data) => {
			this.setState({
				user: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "user/get_user_profile/" + this.props.id, (data) => {
			this.setState({
				userProfile: data,
			});
		}, (response) => {
			console.log(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	saveUserValue(prop, value) {
		if (this.state.user[prop] !== value) {
			const params = {
				id: this.props.id,
				[prop]: value,
			};

			postRequest.call(this, "user/update_user", params, () => {
				const user = { ...this.state.user };

				user[prop] = value;
				this.setState({ user });
				nm.info("The property has been updated");
			}, (response) => {
				this.refresh();
				nm.warning(response.statusText);
			}, (error) => {
				this.refresh();
				nm.error(error.message);
			});
		}
	}

	isStudentOrRetired() {
		const role = this.state.professions.find(
			(p) => (p.id === this.state.userProfile.profession_id),
		);
		if (role === undefined) {
			return false;
		}
		return role.name === "Student" || role.name === "Retired";
	}

	isProfileFormValid() {
		let valid = true;
		const malta = this.state.countries.find(
			(country) => (country.name === "Malta"),
		);
		if (malta === undefined
			|| this.state.userProfile.first_name === ""
			|| this.state.userProfile.last_name === ""
			|| this.state.userProfile.domains_of_interest === null
			|| this.state.userProfile.experience === null
			|| this.state.userProfile.expertise_id === null
			|| this.state.userProfile.gender === null
			|| this.state.userProfile.how_heard === null
			|| this.state.userProfile.nationality_id === null
			|| this.state.userProfile.profession_id === null
			|| this.state.userProfile.residency === null
			|| (
				this.isStudentOrRetired() === false
				&& (this.state.userProfile.sector === null || this.state.userProfile.industry_id === null)
			)
		) {
			nm.warning("Please fill in all of the required fields");
			valid = false;
		}
		if (malta !== undefined) {
			if (
				this.state.nationality_id !== null
				&& this.state.userProfile.nationality_id !== malta.id
				&& this.state.userProfile.residency !== ""
				&& this.state.userProfile.residency !== "Malta"
				&& this.state.userProfile.residency !== "Gozo"
			) {
				nm.warning("The account is only available to Maltese or Gozo residents or Maltese nationals");
				valid = false;
			}
		}
		return valid;
	}

	updateProfile() {
		postRequest.call(this, "private/update_profile", {
			user_id: this.props.id,
			data: this.state.userProfile,
		}, () => {
			nm.info("The information has been updated");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	setProfileValues(newProfile) {
		this.setState({
			userProfile: newProfile,
		});

		if (this.isProfileFormValid()) {
			this.updateProfile();
		}
	}

	render() {
		return (
			<div className={"row"}>
				<div className="col-md-12">
					<h2>Global</h2>
				</div>

				{this.state.user !== null
					? <div className="col-md-12">
						<FormLine
							label={"ID"}
							value={this.state.user.id}
							disabled={true}
						/>
						<FormLine
							label={"Email"}
							value={this.state.user.email}
							disabled={true}
						/>

						{/* <FormLine
							label={"First name"}
							value={this.state.user.first_name}
							onBlur={(s) => this.saveUserValue("first_name", s)}
						/>
						<FormLine
							label={"Last name"}
							value={this.state.user.last_name}
							onBlur={(s) => this.saveUserValue("last_name", s)}
						/> */}
						<br/>
						{/* <FormLine
							label="Is admin"
							type={"checkbox"}
							value={this.state.user.is_admin}
							onChange={(s) => this.saveUserValue("is_admin", s)}
						/> */}
						<FormLine
							label="Is active"
							type={"checkbox"}
							value={this.state.user.is_active}
							onChange={(s) => this.saveUserValue("is_active", s)}
						/>
						<br/>
						<FormLine
							label="Accept to receive communications"
							type={"checkbox"}
							value={this.state.user.accept_communication}
							disabled={true}
						/>
						<FormLine
							label="Accept to receive request notifications (only for active admins)"
							type={"checkbox"}
							value={this.state.user.accept_request_notification}
							disabled={true}
						/>
						<h2>User Profile</h2>
						{this.state.userProfile != null
							&& <UpdateProfile
								userProfile={this.state.userProfile}
								setProfileValues={this.setProfileValues} />
						}
					</div>
					: <Loading/>
				}
			</div>
		);
	}
}
