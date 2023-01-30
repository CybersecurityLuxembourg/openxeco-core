import React from "react";
import "./UserUser.css";
import { NotificationManager as nm } from "react-notifications";
import Popup from "reactjs-popup";
import Loading from "../box/Loading.jsx";
import Info from "../box/Info.jsx";
import DynamicTable from "../table/DynamicTable.jsx";
import { getRequest, postRequest } from "../../utils/request.jsx";
import User from "../item/User.jsx";
import FormLine from "../button/FormLine.jsx";
import { validateEmail, validatePassword } from "../../utils/re.jsx";
import { dictToURI } from "../../utils/url.jsx";
import DialogUserFilter from "../dialog/DialogUserFilter.jsx";

export default class UserUser extends React.Component {
	constructor(props) {
		super(props);

		this.fetchUsers = this.fetchUsers.bind(this);

		this.state = {
			users: null,
			pagination: null,
			email: null,
			provisoryPassword: "ProvisoryPassword!" + (Math.floor(Math.random() * 90000) + 10000),
			page: 1,
			per_page: 10,
			filters: {
				email: null,
			},
		};
	}

	componentDidMount() {
		this.refresh();
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.filters !== this.state.filters) this.refresh();
	}

	refresh() {
		this.setState({
			users: null,
			page: 1,
		}, () => {
			this.fetchUsers();
		});
	}

	fetchUsers(page) {
		this.setState({
			users: null,
		});

		const params = {
			page: Number.isInteger(page) ? page : this.state.page,
			per_page: 10,
			...this.state.filters,
		};

		getRequest.call(this, "user/get_users?" + dictToURI(params), (data) => {
			this.setState({
				users: data.items,
				pagination: data.pagination,
				page,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	addUser(close) {
		const params = {
			email: this.state.email,
			password: this.state.provisoryPassword,
		};

		postRequest.call(this, "user/add_user", params, () => {
			this.refresh();
			this.setState({ email: null });
			if (close) {
				close();
			}
			nm.info("The user has been added");
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
		const columns = [
			{
				Header: "Email",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<User
						id={value.id}
						email={value.email}
						afterDeletion={() => this.refresh()}
						user={this.props.user}
					/>
				),
			},
			{
				Header: "Is admin",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					value.is_admin === 1 ? "Yes" : ""
				),
				width: 50,
			},
			{
				Header: "Is active",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					value.is_active === 1 ? "Yes" : ""
				),
				width: 50,
			},
		];

		return (
			<div id="UserUser" className="max-sized-page fade-in">
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>{this.state.pagination !== null ? this.state.pagination.total : 0} User{this.state.pagination !== null && this.state.pagination.total > 1 ? "s" : ""}</h1>
						<div className="top-right-buttons">
							<button
								onClick={() => this.refresh()}>
								<i className="fas fa-redo-alt"/>
							</button>
							<Popup
								trigger={
									<button>
										<i className="fas fa-plus"/>
									</button>
								}
								modal
							>
								{(close) => <div className={"row row-spaced"}>
									<div className={"col-md-9"}>
										<h2>Add a new user</h2>
									</div>

									<div className={"col-md-3"}>
										<div className="top-right-buttons">
											<button
												className={"grey-background"}
												data-hover="Close"
												data-active=""
												onClick={close}>
												<span><i className="far fa-times-circle"/></span>
											</button>
										</div>
									</div>

									<div className="col-md-12">
										<FormLine
											label={"Email"}
											value={this.state.email}
											onChange={(v) => this.changeState("email", v)}
											format={validateEmail}
										/>
										<FormLine
											label={"Provisory password"}
											value={this.state.provisoryPassword}
											onChange={(v) => this.changeState("provisoryPassword", v)}
											format={validatePassword}
										/>
										<Info
											content={
												<div>
													The password must:<br/>
													<li>contain at least 1 lowercase alphabetical character</li>
													<li>contain at least 1 uppercase alphabetical character</li>
													<li>contain at least 1 numeric character</li>
													<li>contain at least 1 special character such as !@#$%^&*</li>
													<li>be between 8 and 30 characters long</li>
												</div>
											}
										/>
										<Info
											content={
												<div>
													{// eslint-disable-next-line
													}An email will be sent to the new user&#39;s address with the provisory password
												</div>
											}
										/>
										<div className="right-buttons">
											<button
												onClick={() => this.addUser(close)}
												disabled={!validateEmail(this.state.email)
													|| !validatePassword(this.state.provisoryPassword)}>
												<i className="fas fa-plus"/> Add a new user
											</button>
										</div>
									</div>
								</div>}
							</Popup>
							<DialogUserFilter
								trigger={
									<button
										className={"blue-background"}
										data-hover="Filter">
										<i className="fas fa-search"/>
									</button>
								}
								applyFilter={(filters) => this.changeState("filters", filters)}
							/>
						</div>
					</div>
					<div className="col-md-12 PageEntity-table">
						{this.state.users !== null
							? <DynamicTable
								columns={columns}
								data={this.state.users}
								pagination={this.state.pagination}
								changePage={this.fetchUsers}
							/>
							: <Loading
								height={500}
							/>
						}
					</div>
				</div>
			</div>
		);
	}
}
