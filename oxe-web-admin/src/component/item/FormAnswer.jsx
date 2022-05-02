import React, { Component } from "react";
import "./FormAnswer.css";
import dompurify from "dompurify";
import Popup from "reactjs-popup";
import Message from "../box/Message.jsx";
import User from "./User.jsx";

export default class FormAnswer extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
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
					<div className={"FormAnswer"}>
						<i className="fas fa-edit"/>
						<div className={"FormAnswer-name"}>
							Answers to {this.props.form.name}
						</div>
					</div>
				}
				modal
				closeOnDocumentClick={false}
			>
				{(close) => <div className="FormAnswer-content row row-spaced">
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

						<h1 className="FormAnswer-title">
							<i className="fas fa-edit"/> Answers to {this.props.form.name}
						</h1>
					</div>

					<div className="col-md-12">
						<h2>
							User
						</h2>
					</div>

					<div className="col-md-12">
						<User
							id={this.props.user}
						/>
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
