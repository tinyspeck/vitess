// Code generated by protoc-gen-gogo. DO NOT EDIT.
// source: vttest.proto

package vttest

import (
	fmt "fmt"
	io "io"
	math "math"
	math_bits "math/bits"

	proto "github.com/golang/protobuf/proto"
)

// Reference imports to suppress errors if they are not otherwise used.
var _ = proto.Marshal
var _ = fmt.Errorf
var _ = math.Inf

// This is a compile-time assertion to ensure that this generated file
// is compatible with the proto package it is being compiled against.
// A compilation error at this line likely means your copy of the
// proto package needs to be updated.
const _ = proto.ProtoPackageIsVersion3 // please upgrade the proto package

// Shard describes a single shard in a keyspace.
type Shard struct {
	// name has to be unique in a keyspace. For unsharded keyspaces, it
	// should be '0'. For sharded keyspace, it should be derived from
	// the keyrange, like '-80' or '40-80'.
	Name string `protobuf:"bytes,1,opt,name=name,proto3" json:"name,omitempty"`
	// db_name_override is the mysql db name for this shard. Has to be
	// globally unique. If not specified, we will by default use
	// 'vt_<keyspace>_<shard>'.
	DbNameOverride       string   `protobuf:"bytes,2,opt,name=db_name_override,json=dbNameOverride,proto3" json:"db_name_override,omitempty"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *Shard) Reset()         { *m = Shard{} }
func (m *Shard) String() string { return proto.CompactTextString(m) }
func (*Shard) ProtoMessage()    {}
func (*Shard) Descriptor() ([]byte, []int) {
	return fileDescriptor_b9b3dc07179a1ec9, []int{0}
}
func (m *Shard) XXX_Unmarshal(b []byte) error {
	return m.Unmarshal(b)
}
func (m *Shard) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	if deterministic {
		return xxx_messageInfo_Shard.Marshal(b, m, deterministic)
	} else {
		b = b[:cap(b)]
		n, err := m.MarshalToSizedBuffer(b)
		if err != nil {
			return nil, err
		}
		return b[:n], nil
	}
}
func (m *Shard) XXX_Merge(src proto.Message) {
	xxx_messageInfo_Shard.Merge(m, src)
}
func (m *Shard) XXX_Size() int {
	return m.Size()
}
func (m *Shard) XXX_DiscardUnknown() {
	xxx_messageInfo_Shard.DiscardUnknown(m)
}

var xxx_messageInfo_Shard proto.InternalMessageInfo

func (m *Shard) GetName() string {
	if m != nil {
		return m.Name
	}
	return ""
}

func (m *Shard) GetDbNameOverride() string {
	if m != nil {
		return m.DbNameOverride
	}
	return ""
}

// Keyspace describes a single keyspace.
type Keyspace struct {
	// name has to be unique in a VTTestTopology.
	Name string `protobuf:"bytes,1,opt,name=name,proto3" json:"name,omitempty"`
	// shards inside this keyspace. Ignored if redirect is set.
	Shards []*Shard `protobuf:"bytes,2,rep,name=shards,proto3" json:"shards,omitempty"`
	// sharding_column_name for this keyspace. Used for v2 calls, but not for v3.
	ShardingColumnName string `protobuf:"bytes,3,opt,name=sharding_column_name,json=shardingColumnName,proto3" json:"sharding_column_name,omitempty"`
	// sharding_column_type for this keyspace. Used for v2 calls, but not for v3.
	ShardingColumnType string `protobuf:"bytes,4,opt,name=sharding_column_type,json=shardingColumnType,proto3" json:"sharding_column_type,omitempty"`
	// redirects all traffic to another keyspace. If set, shards is ignored.
	ServedFrom string `protobuf:"bytes,5,opt,name=served_from,json=servedFrom,proto3" json:"served_from,omitempty"`
	// number of replica tablets to instantiate. This includes the master tablet.
	ReplicaCount int32 `protobuf:"varint,6,opt,name=replica_count,json=replicaCount,proto3" json:"replica_count,omitempty"`
	// number of rdonly tablets to instantiate.
	RdonlyCount          int32    `protobuf:"varint,7,opt,name=rdonly_count,json=rdonlyCount,proto3" json:"rdonly_count,omitempty"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *Keyspace) Reset()         { *m = Keyspace{} }
func (m *Keyspace) String() string { return proto.CompactTextString(m) }
func (*Keyspace) ProtoMessage()    {}
func (*Keyspace) Descriptor() ([]byte, []int) {
	return fileDescriptor_b9b3dc07179a1ec9, []int{1}
}
func (m *Keyspace) XXX_Unmarshal(b []byte) error {
	return m.Unmarshal(b)
}
func (m *Keyspace) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	if deterministic {
		return xxx_messageInfo_Keyspace.Marshal(b, m, deterministic)
	} else {
		b = b[:cap(b)]
		n, err := m.MarshalToSizedBuffer(b)
		if err != nil {
			return nil, err
		}
		return b[:n], nil
	}
}
func (m *Keyspace) XXX_Merge(src proto.Message) {
	xxx_messageInfo_Keyspace.Merge(m, src)
}
func (m *Keyspace) XXX_Size() int {
	return m.Size()
}
func (m *Keyspace) XXX_DiscardUnknown() {
	xxx_messageInfo_Keyspace.DiscardUnknown(m)
}

var xxx_messageInfo_Keyspace proto.InternalMessageInfo

func (m *Keyspace) GetName() string {
	if m != nil {
		return m.Name
	}
	return ""
}

func (m *Keyspace) GetShards() []*Shard {
	if m != nil {
		return m.Shards
	}
	return nil
}

func (m *Keyspace) GetShardingColumnName() string {
	if m != nil {
		return m.ShardingColumnName
	}
	return ""
}

func (m *Keyspace) GetShardingColumnType() string {
	if m != nil {
		return m.ShardingColumnType
	}
	return ""
}

func (m *Keyspace) GetServedFrom() string {
	if m != nil {
		return m.ServedFrom
	}
	return ""
}

func (m *Keyspace) GetReplicaCount() int32 {
	if m != nil {
		return m.ReplicaCount
	}
	return 0
}

func (m *Keyspace) GetRdonlyCount() int32 {
	if m != nil {
		return m.RdonlyCount
	}
	return 0
}

// VTTestTopology describes the keyspaces in the topology.
type VTTestTopology struct {
	// all keyspaces in the topology.
	Keyspaces []*Keyspace `protobuf:"bytes,1,rep,name=keyspaces,proto3" json:"keyspaces,omitempty"`
	// list of cells the keyspaces reside in. Vtgate is started in only the first cell.
	Cells                []string `protobuf:"bytes,2,rep,name=cells,proto3" json:"cells,omitempty"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *VTTestTopology) Reset()         { *m = VTTestTopology{} }
func (m *VTTestTopology) String() string { return proto.CompactTextString(m) }
func (*VTTestTopology) ProtoMessage()    {}
func (*VTTestTopology) Descriptor() ([]byte, []int) {
	return fileDescriptor_b9b3dc07179a1ec9, []int{2}
}
func (m *VTTestTopology) XXX_Unmarshal(b []byte) error {
	return m.Unmarshal(b)
}
func (m *VTTestTopology) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	if deterministic {
		return xxx_messageInfo_VTTestTopology.Marshal(b, m, deterministic)
	} else {
		b = b[:cap(b)]
		n, err := m.MarshalToSizedBuffer(b)
		if err != nil {
			return nil, err
		}
		return b[:n], nil
	}
}
func (m *VTTestTopology) XXX_Merge(src proto.Message) {
	xxx_messageInfo_VTTestTopology.Merge(m, src)
}
func (m *VTTestTopology) XXX_Size() int {
	return m.Size()
}
func (m *VTTestTopology) XXX_DiscardUnknown() {
	xxx_messageInfo_VTTestTopology.DiscardUnknown(m)
}

var xxx_messageInfo_VTTestTopology proto.InternalMessageInfo

func (m *VTTestTopology) GetKeyspaces() []*Keyspace {
	if m != nil {
		return m.Keyspaces
	}
	return nil
}

func (m *VTTestTopology) GetCells() []string {
	if m != nil {
		return m.Cells
	}
	return nil
}

func init() {
	proto.RegisterType((*Shard)(nil), "vttest.Shard")
	proto.RegisterType((*Keyspace)(nil), "vttest.Keyspace")
	proto.RegisterType((*VTTestTopology)(nil), "vttest.VTTestTopology")
}

func init() { proto.RegisterFile("vttest.proto", fileDescriptor_b9b3dc07179a1ec9) }

var fileDescriptor_b9b3dc07179a1ec9 = []byte{
	// 347 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff, 0x6c, 0x51, 0xcd, 0x4a, 0xeb, 0x40,
	0x18, 0xbd, 0xd3, 0x36, 0xb9, 0xb7, 0x5f, 0x7f, 0x28, 0x43, 0x17, 0xb3, 0xca, 0xed, 0x6d, 0xb9,
	0x90, 0x55, 0x22, 0x8a, 0x2f, 0x60, 0xd1, 0x8d, 0xa0, 0x10, 0x43, 0x17, 0x6e, 0x42, 0x9a, 0x7c,
	0xd6, 0x60, 0x92, 0x09, 0x33, 0xd3, 0x40, 0x5e, 0xc3, 0x95, 0x8f, 0xe4, 0xd2, 0x47, 0x90, 0xfa,
	0x22, 0x92, 0x99, 0x14, 0x37, 0xdd, 0x9d, 0xef, 0x9c, 0x33, 0xdf, 0xf9, 0x38, 0x03, 0xe3, 0x5a,
	0x29, 0x94, 0xca, 0xab, 0x04, 0x57, 0x9c, 0xda, 0x66, 0x5a, 0x5e, 0x83, 0xf5, 0xf0, 0x1c, 0x8b,
	0x94, 0x52, 0x18, 0x94, 0x71, 0x81, 0x8c, 0x2c, 0x88, 0x3b, 0x0c, 0x34, 0xa6, 0x2e, 0xcc, 0xd2,
	0x6d, 0xd4, 0xc2, 0x88, 0xd7, 0x28, 0x44, 0x96, 0x22, 0xeb, 0x69, 0x7d, 0x9a, 0x6e, 0xef, 0xe2,
	0x02, 0xef, 0x3b, 0x76, 0xf9, 0xda, 0x83, 0x3f, 0xb7, 0xd8, 0xc8, 0x2a, 0x4e, 0xf0, 0xe4, 0xaa,
	0xff, 0x60, 0xcb, 0x36, 0x47, 0xb2, 0xde, 0xa2, 0xef, 0x8e, 0xce, 0x27, 0x5e, 0x77, 0x8e, 0x4e,
	0x0f, 0x3a, 0x91, 0x9e, 0xc1, 0x5c, 0xa3, 0xac, 0xdc, 0x45, 0x09, 0xcf, 0xf7, 0x45, 0xa9, 0xe3,
	0x59, 0x5f, 0xaf, 0xa2, 0x47, 0x6d, 0xad, 0xa5, 0xf6, 0x82, 0x53, 0x2f, 0x54, 0x53, 0x21, 0x1b,
	0x9c, 0x7a, 0x11, 0x36, 0x15, 0xd2, 0xbf, 0x30, 0x92, 0x28, 0x6a, 0x4c, 0xa3, 0x27, 0xc1, 0x0b,
	0x66, 0x69, 0x23, 0x18, 0xea, 0x46, 0xf0, 0x82, 0xae, 0x60, 0x22, 0xb0, 0xca, 0xb3, 0x24, 0x8e,
	0x12, 0xbe, 0x2f, 0x15, 0xb3, 0x17, 0xc4, 0xb5, 0x82, 0x71, 0x47, 0xae, 0x5b, 0x8e, 0xfe, 0x83,
	0xb1, 0x48, 0x79, 0x99, 0x37, 0x9d, 0xe7, 0xb7, 0xf6, 0x8c, 0x0c, 0xa7, 0x2d, 0xcb, 0x0d, 0x4c,
	0x37, 0x61, 0x88, 0x52, 0x85, 0xbc, 0xe2, 0x39, 0xdf, 0x35, 0xd4, 0x83, 0xe1, 0x4b, 0xd7, 0x92,
	0x64, 0x44, 0x17, 0x31, 0x3b, 0x16, 0x71, 0xac, 0x2f, 0xf8, 0xb1, 0xd0, 0x39, 0x58, 0x09, 0xe6,
	0xb9, 0x29, 0x6d, 0x18, 0x98, 0xe1, 0xea, 0xf2, 0xfd, 0xe0, 0x90, 0x8f, 0x83, 0x43, 0x3e, 0x0f,
	0x0e, 0x79, 0xfb, 0x72, 0x7e, 0x3d, 0xae, 0xea, 0x4c, 0xa1, 0x94, 0x5e, 0xc6, 0x7d, 0x83, 0xfc,
	0x1d, 0xf7, 0x6b, 0xe5, 0xeb, 0xbf, 0xf6, 0x4d, 0xc0, 0xd6, 0xd6, 0xd3, 0xc5, 0x77, 0x00, 0x00,
	0x00, 0xff, 0xff, 0xd7, 0x26, 0x4d, 0xc0, 0x09, 0x02, 0x00, 0x00,
}

func (m *Shard) Marshal() (dAtA []byte, err error) {
	size := m.Size()
	dAtA = make([]byte, size)
	n, err := m.MarshalToSizedBuffer(dAtA[:size])
	if err != nil {
		return nil, err
	}
	return dAtA[:n], nil
}

func (m *Shard) MarshalTo(dAtA []byte) (int, error) {
	size := m.Size()
	return m.MarshalToSizedBuffer(dAtA[:size])
}

func (m *Shard) MarshalToSizedBuffer(dAtA []byte) (int, error) {
	i := len(dAtA)
	_ = i
	var l int
	_ = l
	if m.XXX_unrecognized != nil {
		i -= len(m.XXX_unrecognized)
		copy(dAtA[i:], m.XXX_unrecognized)
	}
	if len(m.DbNameOverride) > 0 {
		i -= len(m.DbNameOverride)
		copy(dAtA[i:], m.DbNameOverride)
		i = encodeVarintVttest(dAtA, i, uint64(len(m.DbNameOverride)))
		i--
		dAtA[i] = 0x12
	}
	if len(m.Name) > 0 {
		i -= len(m.Name)
		copy(dAtA[i:], m.Name)
		i = encodeVarintVttest(dAtA, i, uint64(len(m.Name)))
		i--
		dAtA[i] = 0xa
	}
	return len(dAtA) - i, nil
}

func (m *Keyspace) Marshal() (dAtA []byte, err error) {
	size := m.Size()
	dAtA = make([]byte, size)
	n, err := m.MarshalToSizedBuffer(dAtA[:size])
	if err != nil {
		return nil, err
	}
	return dAtA[:n], nil
}

func (m *Keyspace) MarshalTo(dAtA []byte) (int, error) {
	size := m.Size()
	return m.MarshalToSizedBuffer(dAtA[:size])
}

func (m *Keyspace) MarshalToSizedBuffer(dAtA []byte) (int, error) {
	i := len(dAtA)
	_ = i
	var l int
	_ = l
	if m.XXX_unrecognized != nil {
		i -= len(m.XXX_unrecognized)
		copy(dAtA[i:], m.XXX_unrecognized)
	}
	if m.RdonlyCount != 0 {
		i = encodeVarintVttest(dAtA, i, uint64(m.RdonlyCount))
		i--
		dAtA[i] = 0x38
	}
	if m.ReplicaCount != 0 {
		i = encodeVarintVttest(dAtA, i, uint64(m.ReplicaCount))
		i--
		dAtA[i] = 0x30
	}
	if len(m.ServedFrom) > 0 {
		i -= len(m.ServedFrom)
		copy(dAtA[i:], m.ServedFrom)
		i = encodeVarintVttest(dAtA, i, uint64(len(m.ServedFrom)))
		i--
		dAtA[i] = 0x2a
	}
	if len(m.ShardingColumnType) > 0 {
		i -= len(m.ShardingColumnType)
		copy(dAtA[i:], m.ShardingColumnType)
		i = encodeVarintVttest(dAtA, i, uint64(len(m.ShardingColumnType)))
		i--
		dAtA[i] = 0x22
	}
	if len(m.ShardingColumnName) > 0 {
		i -= len(m.ShardingColumnName)
		copy(dAtA[i:], m.ShardingColumnName)
		i = encodeVarintVttest(dAtA, i, uint64(len(m.ShardingColumnName)))
		i--
		dAtA[i] = 0x1a
	}
	if len(m.Shards) > 0 {
		for iNdEx := len(m.Shards) - 1; iNdEx >= 0; iNdEx-- {
			{
				size, err := m.Shards[iNdEx].MarshalToSizedBuffer(dAtA[:i])
				if err != nil {
					return 0, err
				}
				i -= size
				i = encodeVarintVttest(dAtA, i, uint64(size))
			}
			i--
			dAtA[i] = 0x12
		}
	}
	if len(m.Name) > 0 {
		i -= len(m.Name)
		copy(dAtA[i:], m.Name)
		i = encodeVarintVttest(dAtA, i, uint64(len(m.Name)))
		i--
		dAtA[i] = 0xa
	}
	return len(dAtA) - i, nil
}

func (m *VTTestTopology) Marshal() (dAtA []byte, err error) {
	size := m.Size()
	dAtA = make([]byte, size)
	n, err := m.MarshalToSizedBuffer(dAtA[:size])
	if err != nil {
		return nil, err
	}
	return dAtA[:n], nil
}

func (m *VTTestTopology) MarshalTo(dAtA []byte) (int, error) {
	size := m.Size()
	return m.MarshalToSizedBuffer(dAtA[:size])
}

func (m *VTTestTopology) MarshalToSizedBuffer(dAtA []byte) (int, error) {
	i := len(dAtA)
	_ = i
	var l int
	_ = l
	if m.XXX_unrecognized != nil {
		i -= len(m.XXX_unrecognized)
		copy(dAtA[i:], m.XXX_unrecognized)
	}
	if len(m.Cells) > 0 {
		for iNdEx := len(m.Cells) - 1; iNdEx >= 0; iNdEx-- {
			i -= len(m.Cells[iNdEx])
			copy(dAtA[i:], m.Cells[iNdEx])
			i = encodeVarintVttest(dAtA, i, uint64(len(m.Cells[iNdEx])))
			i--
			dAtA[i] = 0x12
		}
	}
	if len(m.Keyspaces) > 0 {
		for iNdEx := len(m.Keyspaces) - 1; iNdEx >= 0; iNdEx-- {
			{
				size, err := m.Keyspaces[iNdEx].MarshalToSizedBuffer(dAtA[:i])
				if err != nil {
					return 0, err
				}
				i -= size
				i = encodeVarintVttest(dAtA, i, uint64(size))
			}
			i--
			dAtA[i] = 0xa
		}
	}
	return len(dAtA) - i, nil
}

func encodeVarintVttest(dAtA []byte, offset int, v uint64) int {
	offset -= sovVttest(v)
	base := offset
	for v >= 1<<7 {
		dAtA[offset] = uint8(v&0x7f | 0x80)
		v >>= 7
		offset++
	}
	dAtA[offset] = uint8(v)
	return base
}
func (m *Shard) Size() (n int) {
	if m == nil {
		return 0
	}
	var l int
	_ = l
	l = len(m.Name)
	if l > 0 {
		n += 1 + l + sovVttest(uint64(l))
	}
	l = len(m.DbNameOverride)
	if l > 0 {
		n += 1 + l + sovVttest(uint64(l))
	}
	if m.XXX_unrecognized != nil {
		n += len(m.XXX_unrecognized)
	}
	return n
}

func (m *Keyspace) Size() (n int) {
	if m == nil {
		return 0
	}
	var l int
	_ = l
	l = len(m.Name)
	if l > 0 {
		n += 1 + l + sovVttest(uint64(l))
	}
	if len(m.Shards) > 0 {
		for _, e := range m.Shards {
			l = e.Size()
			n += 1 + l + sovVttest(uint64(l))
		}
	}
	l = len(m.ShardingColumnName)
	if l > 0 {
		n += 1 + l + sovVttest(uint64(l))
	}
	l = len(m.ShardingColumnType)
	if l > 0 {
		n += 1 + l + sovVttest(uint64(l))
	}
	l = len(m.ServedFrom)
	if l > 0 {
		n += 1 + l + sovVttest(uint64(l))
	}
	if m.ReplicaCount != 0 {
		n += 1 + sovVttest(uint64(m.ReplicaCount))
	}
	if m.RdonlyCount != 0 {
		n += 1 + sovVttest(uint64(m.RdonlyCount))
	}
	if m.XXX_unrecognized != nil {
		n += len(m.XXX_unrecognized)
	}
	return n
}

func (m *VTTestTopology) Size() (n int) {
	if m == nil {
		return 0
	}
	var l int
	_ = l
	if len(m.Keyspaces) > 0 {
		for _, e := range m.Keyspaces {
			l = e.Size()
			n += 1 + l + sovVttest(uint64(l))
		}
	}
	if len(m.Cells) > 0 {
		for _, s := range m.Cells {
			l = len(s)
			n += 1 + l + sovVttest(uint64(l))
		}
	}
	if m.XXX_unrecognized != nil {
		n += len(m.XXX_unrecognized)
	}
	return n
}

func sovVttest(x uint64) (n int) {
	return (math_bits.Len64(x|1) + 6) / 7
}
func sozVttest(x uint64) (n int) {
	return sovVttest(uint64((x << 1) ^ uint64((int64(x) >> 63))))
}
func (m *Shard) Unmarshal(dAtA []byte) error {
	l := len(dAtA)
	iNdEx := 0
	for iNdEx < l {
		preIndex := iNdEx
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return ErrIntOverflowVttest
			}
			if iNdEx >= l {
				return io.ErrUnexpectedEOF
			}
			b := dAtA[iNdEx]
			iNdEx++
			wire |= uint64(b&0x7F) << shift
			if b < 0x80 {
				break
			}
		}
		fieldNum := int32(wire >> 3)
		wireType := int(wire & 0x7)
		if wireType == 4 {
			return fmt.Errorf("proto: Shard: wiretype end group for non-group")
		}
		if fieldNum <= 0 {
			return fmt.Errorf("proto: Shard: illegal tag %d (wire type %d)", fieldNum, wire)
		}
		switch fieldNum {
		case 1:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field Name", wireType)
			}
			var stringLen uint64
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowVttest
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				stringLen |= uint64(b&0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			intStringLen := int(stringLen)
			if intStringLen < 0 {
				return ErrInvalidLengthVttest
			}
			postIndex := iNdEx + intStringLen
			if postIndex < 0 {
				return ErrInvalidLengthVttest
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.Name = string(dAtA[iNdEx:postIndex])
			iNdEx = postIndex
		case 2:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field DbNameOverride", wireType)
			}
			var stringLen uint64
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowVttest
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				stringLen |= uint64(b&0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			intStringLen := int(stringLen)
			if intStringLen < 0 {
				return ErrInvalidLengthVttest
			}
			postIndex := iNdEx + intStringLen
			if postIndex < 0 {
				return ErrInvalidLengthVttest
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.DbNameOverride = string(dAtA[iNdEx:postIndex])
			iNdEx = postIndex
		default:
			iNdEx = preIndex
			skippy, err := skipVttest(dAtA[iNdEx:])
			if err != nil {
				return err
			}
			if skippy < 0 {
				return ErrInvalidLengthVttest
			}
			if (iNdEx + skippy) < 0 {
				return ErrInvalidLengthVttest
			}
			if (iNdEx + skippy) > l {
				return io.ErrUnexpectedEOF
			}
			m.XXX_unrecognized = append(m.XXX_unrecognized, dAtA[iNdEx:iNdEx+skippy]...)
			iNdEx += skippy
		}
	}

	if iNdEx > l {
		return io.ErrUnexpectedEOF
	}
	return nil
}
func (m *Keyspace) Unmarshal(dAtA []byte) error {
	l := len(dAtA)
	iNdEx := 0
	for iNdEx < l {
		preIndex := iNdEx
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return ErrIntOverflowVttest
			}
			if iNdEx >= l {
				return io.ErrUnexpectedEOF
			}
			b := dAtA[iNdEx]
			iNdEx++
			wire |= uint64(b&0x7F) << shift
			if b < 0x80 {
				break
			}
		}
		fieldNum := int32(wire >> 3)
		wireType := int(wire & 0x7)
		if wireType == 4 {
			return fmt.Errorf("proto: Keyspace: wiretype end group for non-group")
		}
		if fieldNum <= 0 {
			return fmt.Errorf("proto: Keyspace: illegal tag %d (wire type %d)", fieldNum, wire)
		}
		switch fieldNum {
		case 1:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field Name", wireType)
			}
			var stringLen uint64
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowVttest
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				stringLen |= uint64(b&0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			intStringLen := int(stringLen)
			if intStringLen < 0 {
				return ErrInvalidLengthVttest
			}
			postIndex := iNdEx + intStringLen
			if postIndex < 0 {
				return ErrInvalidLengthVttest
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.Name = string(dAtA[iNdEx:postIndex])
			iNdEx = postIndex
		case 2:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field Shards", wireType)
			}
			var msglen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowVttest
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				msglen |= int(b&0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			if msglen < 0 {
				return ErrInvalidLengthVttest
			}
			postIndex := iNdEx + msglen
			if postIndex < 0 {
				return ErrInvalidLengthVttest
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.Shards = append(m.Shards, &Shard{})
			if err := m.Shards[len(m.Shards)-1].Unmarshal(dAtA[iNdEx:postIndex]); err != nil {
				return err
			}
			iNdEx = postIndex
		case 3:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field ShardingColumnName", wireType)
			}
			var stringLen uint64
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowVttest
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				stringLen |= uint64(b&0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			intStringLen := int(stringLen)
			if intStringLen < 0 {
				return ErrInvalidLengthVttest
			}
			postIndex := iNdEx + intStringLen
			if postIndex < 0 {
				return ErrInvalidLengthVttest
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.ShardingColumnName = string(dAtA[iNdEx:postIndex])
			iNdEx = postIndex
		case 4:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field ShardingColumnType", wireType)
			}
			var stringLen uint64
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowVttest
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				stringLen |= uint64(b&0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			intStringLen := int(stringLen)
			if intStringLen < 0 {
				return ErrInvalidLengthVttest
			}
			postIndex := iNdEx + intStringLen
			if postIndex < 0 {
				return ErrInvalidLengthVttest
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.ShardingColumnType = string(dAtA[iNdEx:postIndex])
			iNdEx = postIndex
		case 5:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field ServedFrom", wireType)
			}
			var stringLen uint64
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowVttest
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				stringLen |= uint64(b&0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			intStringLen := int(stringLen)
			if intStringLen < 0 {
				return ErrInvalidLengthVttest
			}
			postIndex := iNdEx + intStringLen
			if postIndex < 0 {
				return ErrInvalidLengthVttest
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.ServedFrom = string(dAtA[iNdEx:postIndex])
			iNdEx = postIndex
		case 6:
			if wireType != 0 {
				return fmt.Errorf("proto: wrong wireType = %d for field ReplicaCount", wireType)
			}
			m.ReplicaCount = 0
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowVttest
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				m.ReplicaCount |= int32(b&0x7F) << shift
				if b < 0x80 {
					break
				}
			}
		case 7:
			if wireType != 0 {
				return fmt.Errorf("proto: wrong wireType = %d for field RdonlyCount", wireType)
			}
			m.RdonlyCount = 0
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowVttest
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				m.RdonlyCount |= int32(b&0x7F) << shift
				if b < 0x80 {
					break
				}
			}
		default:
			iNdEx = preIndex
			skippy, err := skipVttest(dAtA[iNdEx:])
			if err != nil {
				return err
			}
			if skippy < 0 {
				return ErrInvalidLengthVttest
			}
			if (iNdEx + skippy) < 0 {
				return ErrInvalidLengthVttest
			}
			if (iNdEx + skippy) > l {
				return io.ErrUnexpectedEOF
			}
			m.XXX_unrecognized = append(m.XXX_unrecognized, dAtA[iNdEx:iNdEx+skippy]...)
			iNdEx += skippy
		}
	}

	if iNdEx > l {
		return io.ErrUnexpectedEOF
	}
	return nil
}
func (m *VTTestTopology) Unmarshal(dAtA []byte) error {
	l := len(dAtA)
	iNdEx := 0
	for iNdEx < l {
		preIndex := iNdEx
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return ErrIntOverflowVttest
			}
			if iNdEx >= l {
				return io.ErrUnexpectedEOF
			}
			b := dAtA[iNdEx]
			iNdEx++
			wire |= uint64(b&0x7F) << shift
			if b < 0x80 {
				break
			}
		}
		fieldNum := int32(wire >> 3)
		wireType := int(wire & 0x7)
		if wireType == 4 {
			return fmt.Errorf("proto: VTTestTopology: wiretype end group for non-group")
		}
		if fieldNum <= 0 {
			return fmt.Errorf("proto: VTTestTopology: illegal tag %d (wire type %d)", fieldNum, wire)
		}
		switch fieldNum {
		case 1:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field Keyspaces", wireType)
			}
			var msglen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowVttest
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				msglen |= int(b&0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			if msglen < 0 {
				return ErrInvalidLengthVttest
			}
			postIndex := iNdEx + msglen
			if postIndex < 0 {
				return ErrInvalidLengthVttest
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.Keyspaces = append(m.Keyspaces, &Keyspace{})
			if err := m.Keyspaces[len(m.Keyspaces)-1].Unmarshal(dAtA[iNdEx:postIndex]); err != nil {
				return err
			}
			iNdEx = postIndex
		case 2:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field Cells", wireType)
			}
			var stringLen uint64
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowVttest
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				stringLen |= uint64(b&0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			intStringLen := int(stringLen)
			if intStringLen < 0 {
				return ErrInvalidLengthVttest
			}
			postIndex := iNdEx + intStringLen
			if postIndex < 0 {
				return ErrInvalidLengthVttest
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.Cells = append(m.Cells, string(dAtA[iNdEx:postIndex]))
			iNdEx = postIndex
		default:
			iNdEx = preIndex
			skippy, err := skipVttest(dAtA[iNdEx:])
			if err != nil {
				return err
			}
			if skippy < 0 {
				return ErrInvalidLengthVttest
			}
			if (iNdEx + skippy) < 0 {
				return ErrInvalidLengthVttest
			}
			if (iNdEx + skippy) > l {
				return io.ErrUnexpectedEOF
			}
			m.XXX_unrecognized = append(m.XXX_unrecognized, dAtA[iNdEx:iNdEx+skippy]...)
			iNdEx += skippy
		}
	}

	if iNdEx > l {
		return io.ErrUnexpectedEOF
	}
	return nil
}
func skipVttest(dAtA []byte) (n int, err error) {
	l := len(dAtA)
	iNdEx := 0
	depth := 0
	for iNdEx < l {
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return 0, ErrIntOverflowVttest
			}
			if iNdEx >= l {
				return 0, io.ErrUnexpectedEOF
			}
			b := dAtA[iNdEx]
			iNdEx++
			wire |= (uint64(b) & 0x7F) << shift
			if b < 0x80 {
				break
			}
		}
		wireType := int(wire & 0x7)
		switch wireType {
		case 0:
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return 0, ErrIntOverflowVttest
				}
				if iNdEx >= l {
					return 0, io.ErrUnexpectedEOF
				}
				iNdEx++
				if dAtA[iNdEx-1] < 0x80 {
					break
				}
			}
		case 1:
			iNdEx += 8
		case 2:
			var length int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return 0, ErrIntOverflowVttest
				}
				if iNdEx >= l {
					return 0, io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				length |= (int(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			if length < 0 {
				return 0, ErrInvalidLengthVttest
			}
			iNdEx += length
		case 3:
			depth++
		case 4:
			if depth == 0 {
				return 0, ErrUnexpectedEndOfGroupVttest
			}
			depth--
		case 5:
			iNdEx += 4
		default:
			return 0, fmt.Errorf("proto: illegal wireType %d", wireType)
		}
		if iNdEx < 0 {
			return 0, ErrInvalidLengthVttest
		}
		if depth == 0 {
			return iNdEx, nil
		}
	}
	return 0, io.ErrUnexpectedEOF
}

var (
	ErrInvalidLengthVttest        = fmt.Errorf("proto: negative length found during unmarshaling")
	ErrIntOverflowVttest          = fmt.Errorf("proto: integer overflow")
	ErrUnexpectedEndOfGroupVttest = fmt.Errorf("proto: unexpected end of group")
)
