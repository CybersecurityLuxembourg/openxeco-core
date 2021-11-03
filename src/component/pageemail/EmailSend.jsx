import React from "react";
import "./EmailSend.css";
import { NotificationManager as nm } from "react-notifications";
import Loading from "../box/Loading.jsx";
import Table from "../table/Table.jsx";
import { getRequest } from "../../utils/request.jsx";
import { extractEmails } from "../../utils/re.jsx";
import { dictToURI } from "../../utils/url.jsx";
import FormLine from "../button/FormLine.jsx";
import CheckBox from "../button/CheckBox.jsx";

export default class EmailSend extends React.Component {
	constructor(props) {
		super(props);

		this.getMailAddresses = this.getMailAddresses.bind(this);

		this.state = {
			databaseAddresses: null,
			additionalAddresses: [],
			ignoredAddresses: [],
			addresses: null,
			includeContacts: false,
			includeUsers: false,
			additionalAddressField: null,
		};
	}

	componentDidMount() {
		this.getMailAddresses();
	}

	componentDidUpdate(_, prevState) {
		if (prevState.includeContacts !== this.state.includeContacts
			|| prevState.includeContacts !== this.state.includeContacts) {
			this.getMailAddresses();
		}
	}

	getMailAddresses() {
		this.setState({
			databaseAddresses: null,
		});

		const params = dictToURI({
			include_contacts: this.state.includeContacts,
			unclide_users: this.state.includeUsers,
		});

		getRequest.call(this, "mail/get_mail_addresses?" + params, (data) => {
			this.setState({
				databaseAddresses: data,
			}, () => {
				let addresses = this.state.addresses ? this.state.addresses : [];
				addresses = addresses.filter((a) => a.source !== "MANUAL INSERT");
				addresses = addresses.concat(data);
				this.setState({ addresses });
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	addManualAddresses(addresses) {
		this.setState({
			additionalAddresses: this.state.additionalAddresses
				.concat(
					[],
					addresses.map((a) => ({
						email: a,
						information: "",
						source: "MANUALLY ADDED",
					})),
				),
			additionalAddressField: null,
		});
	}

	addOrRemoveIgnoredAddress(address, isToAdd) {
		const ignoredAddresses = this.state.ignoredAddresses.map((a) => a);

		if (!isToAdd) {
			ignoredAddresses.push(address);
		} else {
			ignoredAddresses.filter((a) => a !== address);
		}

		this.setState({ ignoredAddresses });
	}

	getAddressesFromText() {
		if (this.state.additionalAddressField) {
			return extractEmails(this.state.additionalAddressField);
		}

		return [];
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		const columns = [
			{
				Header: "email",
				accessor: "email",
			},
			{
				Header: "Information",
				accessor: "information",
			},
			{
				Header: "Source",
				accessor: "source",
			},
			{
				id: "123",
				Header: "Active",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<CheckBox
						className={"Table-CheckBox"}
						value={this.state.ignoredAddresses.indexOf(value.email) < 0}
						onClick={(v) => this.addOrRemoveIgnoredAddress(value.email, v)}
					/>
				),
				width: 100,
			},
		];

		return (
			<div id="ArticleList" className="page max-sized-page">
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>Send a communication via email</h1>
					</div>

					<div className="col-md-12">
						<h2>Step 1: Select addresses</h2>
					</div>

					<div className="col-md-12 row-spaced">
						<FormLine
							label={"Include contacts of companies"}
							type={"checkbox"}
							value={this.state.includeContacts}
							onChange={(v) => this.changeState("includeContacts", v)}
						/>
						<FormLine
							label={"Include users"}
							type={"checkbox"}
							value={this.state.includeUsers}
							onChange={(v) => this.changeState("includeUsers", v)}
						/>
					</div>

					<div className="col-md-12">
						<FormLine
							label={"Add addresses manually"}
							type={"textarea"}
							value={this.state.additionalAddressField}
							onChange={(v) => this.changeState("additionalAddressField", v)}
						/>
					</div>

					<div className="col-md-6">
					</div>

					<div className="col-md-6">
						{this.getAddressesFromText().map((a) => <div
							key={a}>
							{a}
						</div>)}
					</div>

					<div className="col-md-12 row-spaced">
						<div className="right-buttons">
							<button
								onClick={() => this.addManualAddresses(this.getAddressesFromText())}
								disabled={this.getAddressesFromText().length === 0}>
								<i className="fas fa-plus"/> Add addresses
							</button>
						</div>
					</div>

					<div className="col-md-12 row-spaced">
						{this.state.addresses
							? <div className="fade-in">
								<Table
									columns={columns}
									data={this.state.addresses}
									showBottomBar={true}
								/>
							</div>
							: <Loading
								height={300}
							/>
						}
					</div>

					<div className="col-md-12">
						<h2>Step 2: Edit content</h2>
					</div>

					<div className="col-md-12 row-spaced">
						<FormLine
							label={"Header"}
							value={this.state.includeUsers}
							onChange={(v) => this.changeState("includeUsers", v)}
							fullWidth={"true"}
						/>
						<FormLine
							label={"Body"}
							type={"editor"}
							value={this.state.includeUsers}
							onChange={(v) => this.changeState("includeUsers", v)}
							fullWidth={"true"}
						/>
					</div>

					<div className="col-md-12">
						<h2>Step 3: Send the emails</h2>
					</div>

					<div className="col-md-12 row-spaced">
					</div>
				</div>
			</div>
		);
	}
}
