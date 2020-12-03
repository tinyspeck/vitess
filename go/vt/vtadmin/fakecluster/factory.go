package fakecluster

import (
	"fmt"
	"math/rand"
	"time"

	pb "vitess.io/vitess/go/vt/proto/vreplication"
)

type VRepStreamFactory struct {
	Cluster               string
	Keyspaces             []string
	KeyspaceShards        map[string][]string
	DefaultKeyspaceShards []string
	CachedStreams         *[]*pb.VRepStream
}

var (
	pokemon = []string{
		"bidoof",
		"charmander",
		"doraemon",
		"drowzee",
		"eevee",
		"garf",
		"ghastly",
		"haunter",
		"magikarp",
		"missingno",
		"mudkip",
		"paul",
		"pikachu",
		"shrek",
		"zacian",
	}
	adjectives = []string{
		"affectionate",
		"bold",
		"beautiful",
		"buff",
		"chubby",
		"cursed",
		"dazzling",
		"delightful",
		"fancy",
		"magnificent",
		"muscular",
		"polite",
		"sneaky",
		"shy",
		"tiny",
	}
)

func (factory *VRepStreamFactory) Streams() []*pb.VRepStream {
	if factory.CachedStreams != nil {
		return *factory.CachedStreams
	}

	streams := factory.CreateN(10)
	factory.CachedStreams = &streams
	return streams
}

func (factory *VRepStreamFactory) Create(options ...func(*pb.VRepStream, int)) *pb.VRepStream {
	return factory.CreateN(1, options...)[0]
}

func (factory *VRepStreamFactory) CreateN(n int, options ...func(*pb.VRepStream, int)) []*pb.VRepStream {
	streams := make([]*pb.VRepStream, n)
	nextId := 1
	if factory.CachedStreams != nil {
		nextId = len(*factory.CachedStreams) + 1
	}

	for i := 0; i < n; i++ {
		s := &pb.VRepStream{
			MaxReplicationLag: 9999,
			MaxTps:            9999,
			Message:           "",
			State:             pb.VRepStreamState_RUNNING,
			TimeUpdated:       randomTimestamp().Unix(),
		}

		s.Id = int64(nextId)
		nextId = nextId + 1

		for _, f := range options {
			f(s, i)
		}

		if s.Cluster == "" {
			s.Cluster = factory.Cluster
		}

		if s.Keyspace == "" {
			s.Keyspace = factory.keyspace()
		}

		if s.Workflow == "" {
			s.Workflow = randomPokemon()
		}

		if s.Shard == "" {
			s.Shard = randomString(factory.DefaultKeyspaceShards)
		}

		streams[i] = s
	}

	return streams
}

func (factory *VRepStreamFactory) keyspace() string {
	return randomString(factory.Keyspaces)
}

func randomPokemon() string {
	return fmt.Sprintf("%v-%v", randomString(adjectives), randomString(pokemon))
}

func randomString(choices []string) string {
	i := rand.Intn(len(choices))
	return choices[i]
}

func randomTimestamp() time.Time {
	min := time.Date(2020, 1, 0, 0, 0, 0, 0, time.UTC).Unix()
	max := time.Now().Unix()
	delta := max - min

	sec := rand.Int63n(delta) + min
	return time.Unix(sec, 0)
}
