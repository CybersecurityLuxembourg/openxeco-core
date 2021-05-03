import React from "react";
import "./CompanyGlobal.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../../utils/request.jsx";
import Loading from "../box/Loading.jsx";
import Message from "../box/Message.jsx";

export default class CompanyGlobal extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			collaborators: null,
		};
	}

	componentDidMount() {
		this.getAddresses();
	}

	getAddresses() {
		this.setState({
			collaborators: null,
		});

		getRequest.call(this, "private/get_my_company_collaborators/" + this.props.companyId, (data) => {
			this.setState({
				collaborators: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	render() {
		if (this.state.collaborators === null
			|| this.state.collaborators === undefined) {
			return <Loading
				height={300}
			/>;
		}

		return (
			<div id="CompanyGlobal" className="max-sized-page fade-in">
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h2>Collaborator</h2>
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						{this.state.collaborators.length === 0
							&& <Message
								text={"No collaborator found for this entity"}
								height={300}
							/>
						}

						{this.state.collaborators.map((c, y) => <div className="col-md-12" key={y}>
							<h3>{c.email}</h3>
						</div>)}
					</div>
				</div>
			</div>
		);
	}
}
