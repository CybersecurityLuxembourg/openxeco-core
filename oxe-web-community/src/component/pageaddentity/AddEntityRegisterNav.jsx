import React from "react";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../../utils/request.jsx";
import { getUrlParameter } from "../../utils/url.jsx";
import AddEntityRegister from "./AddEntityRegister.jsx";
import AddEntityRegisterIntro from "./AddEntityRegisterIntro.jsx";
import "./AddEntityRegister.css";

export default class AddEntityRegisterNav extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			checkedVerified: false,
			verified: false,
		};
	}

	// eslint-disable-next-line class-methods-use-this
	componentDidMount() {
		if (getUrlParameter("action") === "verify_register") {
			getRequest.call(this, "/entity/verify_work_email/" + getUrlParameter("token"), () => {
				this.setState({
					checkedVerified: true,
					verified: true,
				});
			}, (response2) => {
				nm.warning(response2.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	render() {
		return (
			<div id="AddEntityRegisterNav" >
				{ this.state.checkedVerified && !this.state.verified
					&& <div>
						The link you used did not work. Please make sure you are
						using the link that was sent to you.
					</div>
				}
				{ this.state.verified
					? <AddEntityRegister
						getNotifications={this.props.getNotifications}
					/>
					: <AddEntityRegisterIntro
						getNotifications={this.props.getNotifications}
					/>
				}
			</div>
		);
	}
}
