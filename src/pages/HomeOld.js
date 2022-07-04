import React, { useEffect, useState } from "react";
import "./pages.css";
import { Tab, TabList, Widget, Tag, Table, Form } from "web3uikit";
import { Link } from "react-router-dom";
import { useMoralis } from "react-moralis";

const Home = () => {
  const [passRate, setPassRate] = useState(0);
  const [totalP, setTotalP] = useState(0);
  const [counted, setCounted] = useState(0);
  const { Moralis, isInitialized } = useMoralis();
  const [proposals, setProposals] = useState();
  Moralis.start({
    serverUrl:
      "https://rpc-mumbai.maticvigil.com/v1/379d20c182931b93eb6b3947045701da772e17d3",
    appId: "379d20c182931b93eb6b3947045701da772e17d3",
    masterKey: "Iqu0DAaeddhwBgKuKCfi9jOtmLU0cLZ2sPniTTdm",
  });

  async function getStatus(proposalId) {
    const ProposalCounts = Moralis.Object.extend("ProposalCount");
    const query = new Moralis.Query(ProposalCounts);
    query.equalTo("uid", proposalId);
    const result = await query.first();

    if (result !== undefined) {
      if (result.attributes.passed) {
        return { color: "green", text: "Passed" };
      } else {
        return { color: "red", text: "Rejected" };
      }
    } else {
      return { color: "blue", text: "Ongoing" };
    }
  }

  useEffect(() => {
    async function getProposals() {
      const Proposals = Moralis.Object.extend("Proposals");
      const query = new Moralis.Query(Proposals);
      query.descending("uid_decimal");
      const results = await query.find();
      const table = await Promise.all(
        results.map(async (e) => [
          e.attributes.uid,
          e.attributes.description,
          <Link
            to="/proposal"
            state={{
              description: e.attributes.description,
              color: (await getStatus(e.attributes.uid)).color,
              text: (await getStatus(e.attributes.uid)).text,
              id: e.attributes.uid,
              proposer: e.attributes.propser,
            }}
          >
            <Tag
              color={(await getStatus(e.attributes.uid)).color}
              text={await getStatus(e.attributes.uid).text}
            />
          </Link>,
        ])
      );
      setProposals(table);
      setTotalP(results.length);
    }

    async function getPassRate() {
      const ProposalCounts = Moralis.Object.extend("ProposalCount");
      const query = new Moralis.Query(ProposalCounts);
      const results = await query.find();
      let votesUp = 0;

      results.forEach((e) => {
        if (e.attributes.passed) {
          votesUp++;
        }
      });

      setCounted(results.length);
      setPassRate((votesUp / results.length) * 100);
    }

    getProposals();
    getPassRate();
  }, [isInitialized]);

  return (
    <>
      <div className="content">
        <TabList defaultActiveKey={1} tabStyle="bulbUnion">
          <Tab tabKey={1} tabName="DAO">
            {proposals && (
              <div className="tabContent">
                Governance Overview
                <div className="widgets">
                  <Widget info={totalP} title="Proposals Created">
                    <div className="extraWidgetInfo">
                      <div className="extraTitle">Pass Rate </div>
                      <div className="progress">
                        <div
                          className="progressPercentage"
                          style={{ width: `${passRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </Widget>
                  <Widget info={424} title="Eligible Voters" />
                  <Widget info={totalP - counted} title="Ongoing Proposals" />
                </div>
                Recent Proposals
                <div style={{ marginTop: "30px" }}>
                  <Table
                    columnsConfig="10% 70% 20%"
                    data={proposals}
                    header={[
                      <span style={{ margin: 15 }}>ID</span>,
                      <span style={{ margin: 15 }}>Description</span>,
                      <span style={{ margin: 15 }}>Status</span>,
                    ]}
                    pageSize={5}
                  />
                </div>
                <Form
                  buttonConfig={{
                    isLoading: false,
                    loadingText: "Submitting Proposal",
                    text: "Submit",
                    theme: "secondary",
                  }}
                  data={[
                    {
                      inputWidth: "100%",
                      name: "New Proposal",
                      type: "textarea",
                      validation: {
                        required: true,
                      },
                      value: "",
                    },
                  ]}
                  onSubmit={(e) => {
                    alert("Proposal Submitted");
                  }}
                  title="Create new proposal"
                ></Form>
              </div>
            )}
          </Tab>
          <Tab tabKey={2} tabName="Forum" />
          <Tab tabKey={3} tabName="Docs" />
        </TabList>
      </div>
      <div className="voting" />
    </>
  );
};

export default Home;
