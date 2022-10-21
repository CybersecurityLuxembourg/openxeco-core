import React, { Component } from "react";
import "./RequestEntityAdd.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";

export default class RequestIndividualAccountAdd extends Component {
	constructor(props) {
		super(props);

		this.insertEntity = this.insertEntity.bind(this);
		this.rejectEntity = this.rejectEntity.bind(this);

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
				country: RequestIndividualAccountAdd.getById(data, this.props.data.nationality_id),
			});
		}, (error) => {
			nm.warning(error.message);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "public/get_public_professions", (data) => {
			this.setState({
				profession: RequestIndividualAccountAdd.getById(data, this.props.data.profession_id),
			});
		}, (error) => {
			nm.warning(error.message);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "public/get_public_industries", (data) => {
			this.setState({
				industry: RequestIndividualAccountAdd.getById(data, this.props.data.industry_id),
			});
		}, (error) => {
			nm.warning(error.message);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "public/get_public_expertise", (data) => {
			this.setState({
				expertise: RequestIndividualAccountAdd.getById(data, this.props.data.expertise_id),
			});
		}, (error) => {
			nm.warning(error.message);
		}, (error) => {
			nm.error(error.message);
		});
	}

	static getById(list, id) {
		const index = list.findIndex((a) => (a.id === id));
		return list[index].name;
	}

	insertEntity() {
		if (this.props.data === undefined || this.props.data === null) {
			nm.warning("Data to be inserted not found");
			return;
		}

		if (this.props.data.id !== undefined) {
			nm.warning("Cannot add an entity with an ID");
			return;
		}

		const params = {
			user_id: this.props.userId,
			data: this.props.data,
		};

		postRequest.call(this, "account/add_profile", params, () => {
			nm.info("The profile has been created");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	rejectEntity() {
		const params = {
			id: this.props.userId,
			status: "REJECTED",
		};
		console.log(params);
		postRequest.call(this, "user/update_user", params, () => {
			nm.info("The profile has been set to rejected");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	render() {
		return (
			<Popup
				className="Popup-small-size"
				trigger={
					<button
						className={"blue-background"}
					>
						<i className="fas fa-tasks"/> Review profile create
					</button>
				}
				modal
				closeOnDocumentClick
			>
				{(close) => (
					<div className="row row-spaced">
						<div className="col-md-12">
							<h2>Review profile create</h2>

							<div className={"top-right-buttons"}>
								<button
									className={"grey-background"}
									onClick={close}>
									<i className="far fa-times-circle"/>
								</button>
							</div>
						</div>

						<div className="col-md-12">
							<FormLine
								label={"Name"}
								value={this.props.data.first_name}
								disabled={true}
							/>
							<FormLine
								label={"Surname"}
								value={this.props.data.last_name}
								disabled={true}
							/>
							<FormLine
								label={"Gender"}
								value={this.props.data.gender}
								disabled={true}
							/>
							<FormLine
								label={"Telephone"}
								value={this.props.data.telephone}
								disabled={true}
							/>
							<FormLine
								label={"Mobile"}
								value={this.props.data.mobile}
								disabled={true}
							/>
							<FormLine
								label={"Role/Profession"}
								value={this.state.profession}
								disabled={true}
							/>
							<FormLine
								label={"Sector"}
								value={this.props.data.sector}
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
								value={this.props.data.residency}
								disabled={true}
							/>
							<FormLine
								label={"Experience"}
								value={this.props.data.experience}
								disabled={true}
							/>
							<FormLine
								label={"Primary Area of Expertise"}
								value={this.state.expertise}
								disabled={true}
							/>
							<FormLine
								label={"How did you hear about us?"}
								value={this.props.data.how_heard}
								disabled={true}
							/>
							<FormLine
								label={"Domains of Interest"}
								value={this.props.data.domains_of_interest}
								disabled={true}
							/>
							<FormLine
								label={"Profile Public?"}
								type={"checkbox"}
								value={this.props.data.public}
								disabled={true}
							/>
						</div>

						<div className="col-md-12 right-buttons">
							<button
								className={"blue-background"}
								onClick={this.insertEntity}
							>
								<i className="fas fa-plus" /> Add account
							</button>
							<button
								className={"grey-background"}
								onClick={this.rejectEntity}
							>
								<i className="fas fa-minus" /> Do not add account
							</button>
						</div>
					</div>
				)}
			</Popup>
		);
	}
}
