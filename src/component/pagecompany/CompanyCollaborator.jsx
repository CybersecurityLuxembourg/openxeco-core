import React from "react";
import "./CompanyCollaborator.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../../utils/request.jsx";
import Loading from "../box/Loading.jsx";
import Message from "../box/Message.jsx";
import DialogHint from "../dialog/DialogHint.jsx";

export default class CompanyCollaborator extends React.Component {
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
			<div id="CompanyCollaborator" className="max-sized-page fade-in">
				<div className={"row"}>
					<div className="col-md-9">
						<h2>Collaborator</h2>
					</div>

					<div className="col-md-3 top-title-menu">
						<DialogHint
							content={
								<div className="row">
									<div className="col-md-12">
										<h2>What&apos;s on this page?</h2>

										<p>
											This page is a simple list of the collaborators
											from the entity. All the physical persons on this list
											are able to request changes.
										</p>

										<p>
											If a collaborator doesn&apos;t seem to be legitimately
											in this list, please contact the administrators.
										</p>
									</div>
								</div>
							}
						/>
					</div>
				</div>

				<div className={"row row-spaced"}>
					{this.state.collaborators.length === 0
						&& <div className="col-md-12">
							<Message
								text={"No collaborator found for this entity"}
								height={300}
							/>
						</div>}

					{this.state.collaborators.map((c) => <div
						className="col-md-6"
						key={c.email}>
						<div className="card">
							<i className="fas fa-user card-icon"/>
							<div className="card-body">
								<div className="card-title">{c.email}</div>
							</div>
						</div>
					</div>)}
				</div>
			</div>
		);
	}
}
