// Code generated by protoc-gen-go. DO NOT EDIT.
// source: vttime.proto

package vttime

import (
	fmt "fmt"
	math "math"

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

// Time represents a time stamp in nanoseconds. In go, use logutil library
// to convert times.
type Time struct {
	Seconds              int64    `protobuf:"varint,1,opt,name=seconds,proto3" json:"seconds,omitempty"`
	Nanoseconds          int32    `protobuf:"varint,2,opt,name=nanoseconds,proto3" json:"nanoseconds,omitempty"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *Time) Reset()         { *m = Time{} }
func (m *Time) String() string { return proto.CompactTextString(m) }
func (*Time) ProtoMessage()    {}
func (*Time) Descriptor() ([]byte, []int) {
	return fileDescriptor_bbeb0d3434911dee, []int{0}
}

func (m *Time) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_Time.Unmarshal(m, b)
}
func (m *Time) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_Time.Marshal(b, m, deterministic)
}
func (m *Time) XXX_Merge(src proto.Message) {
	xxx_messageInfo_Time.Merge(m, src)
}
func (m *Time) XXX_Size() int {
	return xxx_messageInfo_Time.Size(m)
}
func (m *Time) XXX_DiscardUnknown() {
	xxx_messageInfo_Time.DiscardUnknown(m)
}

var xxx_messageInfo_Time proto.InternalMessageInfo

func (m *Time) GetSeconds() int64 {
	if m != nil {
		return m.Seconds
	}
	return 0
}

func (m *Time) GetNanoseconds() int32 {
	if m != nil {
		return m.Nanoseconds
	}
	return 0
}

type Duration struct {
	Seconds              int64    `protobuf:"varint,1,opt,name=seconds,proto3" json:"seconds,omitempty"`
	Nanos                int32    `protobuf:"varint,2,opt,name=nanos,proto3" json:"nanos,omitempty"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *Duration) Reset()         { *m = Duration{} }
func (m *Duration) String() string { return proto.CompactTextString(m) }
func (*Duration) ProtoMessage()    {}
func (*Duration) Descriptor() ([]byte, []int) {
	return fileDescriptor_bbeb0d3434911dee, []int{1}
}

func (m *Duration) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_Duration.Unmarshal(m, b)
}
func (m *Duration) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_Duration.Marshal(b, m, deterministic)
}
func (m *Duration) XXX_Merge(src proto.Message) {
	xxx_messageInfo_Duration.Merge(m, src)
}
func (m *Duration) XXX_Size() int {
	return xxx_messageInfo_Duration.Size(m)
}
func (m *Duration) XXX_DiscardUnknown() {
	xxx_messageInfo_Duration.DiscardUnknown(m)
}

var xxx_messageInfo_Duration proto.InternalMessageInfo

func (m *Duration) GetSeconds() int64 {
	if m != nil {
		return m.Seconds
	}
	return 0
}

func (m *Duration) GetNanos() int32 {
	if m != nil {
		return m.Nanos
	}
	return 0
}

func init() {
	proto.RegisterType((*Time)(nil), "vttime.Time")
	proto.RegisterType((*Duration)(nil), "vttime.Duration")
}

func init() { proto.RegisterFile("vttime.proto", fileDescriptor_bbeb0d3434911dee) }

var fileDescriptor_bbeb0d3434911dee = []byte{
	// 144 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff, 0xe2, 0xe2, 0x29, 0x2b, 0x29, 0xc9,
	0xcc, 0x4d, 0xd5, 0x2b, 0x28, 0xca, 0x2f, 0xc9, 0x17, 0x62, 0x83, 0xf0, 0x94, 0x9c, 0xb8, 0x58,
	0x42, 0x32, 0x73, 0x53, 0x85, 0x24, 0xb8, 0xd8, 0x8b, 0x53, 0x93, 0xf3, 0xf3, 0x52, 0x8a, 0x25,
	0x18, 0x15, 0x18, 0x35, 0x98, 0x83, 0x60, 0x5c, 0x21, 0x05, 0x2e, 0xee, 0xbc, 0xc4, 0xbc, 0x7c,
	0x98, 0x2c, 0x93, 0x02, 0xa3, 0x06, 0x6b, 0x10, 0xb2, 0x90, 0x92, 0x15, 0x17, 0x87, 0x4b, 0x69,
	0x51, 0x62, 0x49, 0x66, 0x7e, 0x1e, 0x1e, 0x73, 0x44, 0xb8, 0x58, 0xc1, 0x9a, 0xa0, 0x26, 0x40,
	0x38, 0x4e, 0xaa, 0x51, 0xca, 0x65, 0x99, 0x25, 0xa9, 0xc5, 0xc5, 0x7a, 0x99, 0xf9, 0xfa, 0x10,
	0x96, 0x7e, 0x7a, 0xbe, 0x7e, 0x59, 0x89, 0x3e, 0xd8, 0x9d, 0xfa, 0x10, 0x67, 0x26, 0xb1, 0x81,
	0x79, 0xc6, 0x80, 0x00, 0x00, 0x00, 0xff, 0xff, 0xc0, 0x24, 0xeb, 0xdd, 0xc5, 0x00, 0x00, 0x00,
}
