import React, { Component } from "react";
// import "./User.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import FormLine from "../../button/FormLine.jsx";
import { getRequest } from "../../../utils/request.jsx";

export default class RequestViewUser extends Component {
	constructor(props) {
		super(props);
		this.state = {
			expertise: "",
			industry: "",
			country: "",
			profession: "",
			domain: "",
		};
	}

	componentDidMount() {
		getRequest.call(this, "public/get_public_countries", (data) => {
			this.setState({
				country: RequestViewUser.getById(data, this.props.user_profile.nationality_id),
			});
		}, (error) => {
			nm.warning(error.message);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "public/get_public_professions", (data) => {
			this.setState({
				profession: RequestViewUser.getById(data, this.props.user_profile.profession_id),
			});
		}, (error) => {
			nm.warning(error.message);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "public/get_public_industries", (data) => {
			this.setState({
				industry: RequestViewUser.getById(data, this.props.user_profile.industry_id),
			});
		}, (error) => {
			nm.warning(error.message);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "public/get_public_expertise", (data) => {
			this.setState({
				expertise: RequestViewUser.getById(data, this.props.user_profile.expertise_id),
			});
		}, (error) => {
			nm.warning(error.message);
		}, (error) => {
			nm.error(error.message);
		});
	}

	static getById(list, id) {
		if (id === undefined || id === null) {
			return "";
		}
		const index = list.findIndex((a) => (a.id === id));
		return list[index].name;
	}

	render() {
		return (
			<Popup
				className="Popup-full-size"
				trigger={
					<div className={"User"}>
						<i className="fas fa-user"/>
						<div className={"User-name"}>
							View User: {this.props.user_profile.email}
						</div>
					</div>
				}
				modal
				closeOnDocumentClick
			>
				{(close) => <div className="row">
					<div className="col-md-12">
						<div className={"top-right-buttons"}>
							<button
								className={"grey-background"}
								data-hover="Close"
								data-active=""
								onClick={close}>
								<span><i className="far fa-times-circle"/></span>
							</button>
						</div>
						<h1 className="User-title">
							{this.props.user_profile.email}
						</h1>

						<div className="col-md-12">
							<FormLine
								label={"Email"}
								value={this.props.user_profile.email || ""}
								disabled={true}
							/>
							<FormLine
								label={"Name"}
								value={this.props.user_profile.first_name || ""}
								disabled={true}
							/>
							<FormLine
								label={"Surname"}
								value={this.props.user_profile.last_name || ""}
								disabled={true}
							/>
							<FormLine
								label={"Gender"}
								value={this.props.user_profile.gender || ""}
								disabled={true}
							/>
							<FormLine
								label={"Telephone"}
								value={this.props.user_profile.telephone || ""}
								disabled={true}
							/>
							<FormLine
								label={"Mobile"}
								value={this.props.user_profile.mobile || ""}
								disabled={true}
							/>
							<FormLine
								label={"Role/Profession"}
								value={this.state.profession}
								disabled={true}
							/>
							<FormLine
								label={"Sector"}
								value={this.props.user_profile.sector || ""}
								disabled={true}
							/>
							<FormLine
								label={"Industry"}
								value={this.state.industry}
								disabled={true}
							/>
							<FormLine
								label={"Nationality"}
								value={this.state.country}
								disabled={true}
							/>
							<FormLine
								label={"Residency"}
								value={this.props.user_profile.residency || ""}
								disabled={true}
							/>
							<FormLine
								label={"Experience"}
								value={this.props.user_profile.experience || ""}
								disabled={true}
							/>
							<FormLine
								label={"Primary Area of Expertise"}
								value={this.state.expertise}
								disabled={true}
							/>
							<FormLine
								label={"How did you hear about us?"}
								value={this.props.user_profile.how_heard || ""}
								disabled={true}
							/>
							<FormLine
								label={"Domains of Interest"}
								value={this.props.user_profile.domains_of_interest || ""}
								disabled={true}
							/>
							<FormLine
								label={"Profile Public?"}
								type={"checkbox"}
								value={this.props.user_profile.public}
								disabled={true}
							/>
						</div>
					</div>
				</div>
				}
			</Popup>
		);
	}
}
