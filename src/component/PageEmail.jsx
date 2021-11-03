import React from "react";
import "./PageArticle.css";
import Tab from "./tab/Tab.jsx";
import EmailSend from "./pageemail/EmailSend.jsx";
import EmailHistory from "./pageemail/EmailHistory.jsx";

export default class PageEmail extends React.Component {
	// eslint-disable-next-line class-methods-use-this
	render() {
		return (
			<div id="PageEmail" className="page max-sized-page">
				<Tab
					menu={[
						"Send a communication",
						"History",
					]}
					content={[
						<EmailSend
							key={"send"}
						/>,
						<EmailHistory
							key={"history"}
						/>,
					]}
				/>
			</div>
		);
	}
}
