import React from 'react';
import './DialogArticleFilter.css'
import Popup from "reactjs-popup";
import FormLine from "../button/FormLine";
import _ from 'lodash';
import {getRequest} from '../../utils/request';
import {NotificationManager as nm} from 'react-notifications';
import Loading from '../box/Loading';


export default class DialogArticleFilter extends React.Component {

    constructor(props) {
        super(props);

        this.state = {};
        this.afterConfirmation = this.afterConfirmation.bind(this);
        this.cancel = this.cancel.bind(this)
        this.changeState = this.changeState.bind(this);
        this.getNumberOfFilter = this.getNumberOfFilter.bind(this);
        this.eraseFilters = this.eraseFilters.bind(this);
        this.applyFilter = this.applyFilter.bind(this);
        this.fetchData = this.fetchData.bind(this);

        this.initialState = {
            open: false,

            allowedFilters: ["name", "status", "media"],

            name: null,
            status: null,
            media: null,

            categories: null,
            taxonomy_values: null,
            articleEnums: null,
        }

        this.state = _.cloneDeep(this.initialState);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!prevState.open && this.state.open) {
            this.fetchData()
        }
    }

    fetchData() {
        getRequest.call(this, "taxonomy/get_taxonomy_categories", data => {
            this.setState({
                categories: data,
            });
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });

        getRequest.call(this, "taxonomy/get_taxonomy_values", data => {
            this.setState({
                taxonomy_values: data,
            });
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });

        getRequest.call(this, "article/get_article_enums", data => {
            this.setState({
                articleEnums: data,
            });
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });
    }

    afterConfirmation() {
        this.props.afterConfirmation();
        document.elementFromPoint(100, 0).click()
    }

    cancel() {
        document.elementFromPoint(100, 0).click()
    }

    eraseFilters() {
        this.setState({...this.initialState}, () => {
            this.fetchData()
        });
    }

    getNumberOfFilter() {
        let n = 0;

        this.state.allowedFilters.map(filter => {
            if (typeof this.state[filter] === "boolean" && this.state[filter])
                n += 1
            if (typeof this.state[filter] === "string" && this.state[filter].length > 0)
                n += 1
            if (Array.isArray(this.state[filter]) && this.state[filter] > 0)
                n += this.state[filter].length
        });

        for (let i in this.state.categories) {
            if (Array.isArray(this.state[this.state.categories[i].name])) {
                n += this.state[this.state.categories[i].name].length
            }
        }

        return n;
    }

    applyFilter() {
        let filters = Object.keys(this.state)
            .filter(key => this.state.allowedFilters.includes(key))
            .reduce((obj, key) => {
                obj[key] = this.state[key];
                return obj;
            }, {});

        let values = [];

        for (let i in this.state.categories) {
            if (Array.isArray(this.state[this.state.categories[i].name])) {
                values = values.concat(this.state[this.state.categories[i].name])
            }
        }

        filters["taxonomy_values"] = values

        this.props.applyFilter(filters);
        this.cancel();
    }

    changeState(field, value) {
        this.setState({[field]: value});
    }

    render() {
        return(
            <Popup
                trigger={
                    <span>
                        {this.props.trigger}
                        {this.getNumberOfFilter() > 0 ?
                            <div className="Badge">
                                {this.getNumberOfFilter()}
                            </div>
                        : ""}
                    </span>
                }
                modal
                onOpen={() => this.changeState("open", true)}
                onClose={() => this.changeState("open", false)}
                closeOnDocumentClick
                className={"slide-in DialogArticleFilter"}
            >
                <div className={"DialogArticleFilter-form"}>
                    <h2>Filter companies</h2>
                    <button
                        className={"link-button"}
                        data-hover="Cancel"
                        data-active=""
                        onClick={this.eraseFilters}
                        disabled={this.getNumberOfFilter() === 0}>
                        <span><i className="fas fa-eraser"/> Erase filters</span>
                    </button>
                    <FormLine
                        label="Title"
                        fullWidth={true}
                        value={this.state.name}
                        onChange={v => this.changeState("name", v)}
                        autofocus={true}
                    />
                    {this.state.articleEnums !== null ?
                        <FormLine
                            label={"Status"}
                            type={"select"}
                            value={this.state.status}
                            options={this.state.articleEnums === null || 
                                typeof this.state.articleEnums.status === "undefined" ? [] :
                                [{value: null, label: "-"}].concat(
                                    this.state.articleEnums.status.map(o => { return {label: o, value: o}})
                                )}
                            onChange={v => this.changeState("status", v)}
                        />
                    :
                        <Loading
                            height={100}
                        />
                    }
                    {this.state.articleEnums !== null ?
                        <FormLine
                            label={"Media"}
                            type={"select"}
                            value={this.state.media}
                            options={this.state.articleEnums === null || 
                                typeof this.state.articleEnums.media === "undefined" ? [] :
                                [{value: null, label: "-"}].concat(
                                    this.state.articleEnums.media.map(o => { return {label: o, value: o}})
                                )}
                            onChange={v => this.changeState("media", v)}
                        />
                    :
                        <Loading
                            height={100}
                        />
                    }
                    {this.state.categories !== null && this.state.taxonomy_values !== null ?
                        this.state.categories.map(c => {
                            return (
                                <FormLine
                                    label={c.name}
                                    type={"multiselect"}
                                    fullWidth={true}
                                    value={this.state[c.name] === undefined ? [] : this.state[c.name]}
                                    options={this.state.taxonomy_values
                                        .filter(v => v.category === c.name)
                                        .map(v => { return {label: v.name, value: v.id}})}
                                    onChange={v => this.changeState(c.name, v)}
                                />
                            )
                        })
                        :
                        <Loading
                            height={200}
                        />
                    }
                </div>
                <div className={"bottom-right-buttons"}>
                    <button
                        className={"grey-background"}
                        data-hover="Close"
                        data-active=""
                        onClick={this.cancel}>
                        <span><i className="far fa-times-circle"/> Close</span>
                    </button>
                    <button
                        data-hover="Apply"
                        data-active=""
                        onClick={this.applyFilter}>
                        <span><i className="far fa-check-circle"/> Apply</span>
                    </button>
                </div>
            </Popup>
        );
    }
}


