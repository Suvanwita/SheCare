const dotenv = require('dotenv');

dotenv.config();

const kafka = require('./client');
const kafkaTopics = require('./topics');

const partitions = 3;
const replicationFactor = 1;

const initTopics = async () => {
  const admin = kafka.admin();
  const topicNames = Object.values(kafkaTopics);

  await admin.connect();

  try {
    const existingTopics = new Set(await admin.listTopics());
    const topicsToCreate = topicNames
      .filter((topic) => !existingTopics.has(topic))
      .map((topic) => ({
        topic,
        numPartitions: partitions,
        replicationFactor
      }));

    if (!topicsToCreate.length) {
      console.log('Kafka topics already exist.');
      return;
    }

    await admin.createTopics({
      topics: topicsToCreate,
      waitForLeaders: true
    });

    console.log(
      `Kafka topics created: ${topicsToCreate.map((topic) => topic.topic).join(', ')}`
    );
  } finally {
    await admin.disconnect();
  }
};

if (require.main === module) {
  initTopics().catch((error) => {
    console.error(`Kafka topic initialization failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  initTopics
};
