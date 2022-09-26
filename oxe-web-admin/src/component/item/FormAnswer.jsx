import React from "react";
import "./FormAnswer.css";
import { NotificationManager as nm } from "react-notifications";
import dompurify from "dompurify";
import Popup from "reactjs-popup";
import Message from "../box/Message.jsx";
import Loading from "../box/Loading.jsx";
import User from "./User.jsx";
import { getRequest } from "../../utils/request.jsx";
import Item from "./Item.jsx";

export default class FormAnswer extends Item {
	constructor(props) {
		super(props);

		this.state = {
			user: null,
		};
	}

	getUser() {
		if (this.props.user) {
			getRequest.call(this, "user/get_user/" + this.props.user, (data) => {
				this.setState({
					user: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	onOpen() {
		this.getUser();
	}

	getAnswerOfQuestion(q) {
		const answer = this.props.answers.filter((a) => a.form_question_id === q);

		if (answer.length > 0) {
			return answer[0];
		}

		return null;
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<Popup
				className="Popup-small-size"
				trigger={
					<div className={"Item FormAnswer"}>
						<i className="fas fa-edit"/>
						<div className={"name"}>
							Answers to {this.props.form.name}
						</div>
					</div>
				}
				modal
				closeOnDocumentClick={false}
				onOpen={() => this.onOpen()}
			>
				{(close) => <div className="FormAnswer-content row row-spaced">
					<div className="col-md-9">
						<h1>
							<i className="fas fa-edit"/> Answers to {this.props.form.name}
						</h1>
					</div>

					<div className="col-md-3">
						<div className={"right-buttons"}>
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
						<h2>
							User
						</h2>
					</div>

					<div className="col-md-12">
						{this.state.user
							? <User
								id={this.state.user.id}
								email={this.state.user.email}
							/>
							: <Loading
								height={100}
							/>
						}
					</div>

					<div className="col-md-12">
						<h2>
							Answers
						</h2>
					</div>

					{this.props.questions.map((q) => (
						<div className="col-md-12" key={q.id}>
							<div className="FormAnswer-question">
								<div dangerouslySetInnerHTML={{
									__html:
									dompurify.sanitize(q.value),
								}} />
							</div>

							<div className="FormAnswer-answer">
								{this.getAnswerOfQuestion(q.id) && this.getAnswerOfQuestion(q.id).value
									? <div dangerouslySetInnerHTML={{
										__html:
										dompurify.sanitize(this.getAnswerOfQuestion(q.id).value),
									}} />
									: <Message
										text="No answer found"
									/>}
							</div>
						</div>
					))}
				</div>
				}
			</Popup>
		);
	}
}
