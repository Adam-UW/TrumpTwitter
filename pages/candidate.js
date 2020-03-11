import fetch from 'isomorphic-unfetch'
import React from "react";
import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from "../components/myLayout";
import Table from "../components/Table";

async function fetchData ({req, query})  {
    const protocol = req
        ? `${req.headers['x-forwarded-proto']}:`
        : location.protocol;
    const host = req ? req.headers['x-forwarded-host'] : location.host;
    const pageRequest = `${protocol}//${host}/api/tweets?id=${query.id}&keyword=${query.keyword}`;
    const res = await fetch(pageRequest);
    const json = await res.json();
    return {name: query.title, data: json, id: query.id}
}


function getTweets(myData) {

    let data = [];
    {myData.candidates_info.map(post => (
        data.push(
            {
                ID: post.twitter_post_id,
                Keyword: post.keyword,
                TweetDate: post.tweet_date,
                Content: post.tweet_string,
            }
    )))}
    return data;
}
function Candidate(ctx) {
    const [
        myData,
        setData
    ] = useState(ctx.data);

    async function refresh(query) {
        const refreshedProps = await fetchData(query);
        setData(refreshedProps.data);
    }
    const columns = React.useMemo(
        () => [
            {
                Header: 'Post ID',
                accessor: 'ID',
            },
            {
                Header: 'Keyword',
                accessor: 'Keyword',
            },
            {
                Header: 'Tweet Date',
                accessor: 'TweetDate'
            },
            {
                Header: 'Post Content',
                accessor: 'Content'
            },
        ],
        []
    );
    const router = useRouter();
    const [value, setName] = useState("");
    const handleSubmit = e => {
        e.preventDefault();
        const req = {pathname: '/candidate', query: {title: ctx.name, id: ctx.id, keyword: value}};
        router.replace(req);
        refresh({query: req.query}).then(r => console.log('Refreshed Data!'));
    };
    const data = getTweets(myData);
    return (
        <Layout>
                <h2 style = {{textAlign: 'left', margin: 'auto'}}>
                    <img src={`/static/images/${ctx.name}.png`} style={{width : 150, height: 150, padding: '10px', margin: 'auto', marginTop: '100px', float: 'center'}} />
                    Tweets from {ctx.name}
                </h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Search for a Keyword:
                    <input type="text" onChange = {e => setName(e.target.value)} />
                </label>
                <input type="submit" value="Submit" />
            </form>
            <Table columns = {columns} data = {data} />
        </Layout>

)}
Candidate.getInitialProps = fetchData;
export default Candidate;