// Code generated by protoc-gen-go. DO NOT EDIT.
// source: vtctlservice.proto

package vtctlservice

import (
	context "context"
	fmt "fmt"
	math "math"

	proto "github.com/golang/protobuf/proto"
	grpc "google.golang.org/grpc"
	codes "google.golang.org/grpc/codes"
	status "google.golang.org/grpc/status"
	vtctldata "vitess.io/vitess/go/vt/proto/vtctldata"
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

func init() { proto.RegisterFile("vtctlservice.proto", fileDescriptor_27055cdbb1148d2b) }

var fileDescriptor_27055cdbb1148d2b = []byte{
	// 146 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff, 0xe2, 0x12, 0x2a, 0x2b, 0x49, 0x2e,
	0xc9, 0x29, 0x4e, 0x2d, 0x2a, 0xcb, 0x4c, 0x4e, 0xd5, 0x2b, 0x28, 0xca, 0x2f, 0xc9, 0x17, 0xe2,
	0x41, 0x16, 0x93, 0xe2, 0x07, 0xf3, 0x52, 0x12, 0x4b, 0x12, 0x21, 0xd2, 0x46, 0x85, 0x5c, 0xac,
	0x61, 0x20, 0x21, 0xa1, 0x0c, 0x2e, 0x61, 0xd7, 0x8a, 0xd4, 0xe4, 0xd2, 0x92, 0x54, 0x30, 0xdf,
	0x39, 0x3f, 0x37, 0x37, 0x31, 0x2f, 0x45, 0x48, 0x55, 0x0f, 0xa1, 0x03, 0x8b, 0x7c, 0x50, 0x6a,
	0x61, 0x69, 0x6a, 0x71, 0x89, 0x94, 0x1a, 0x21, 0x65, 0xc5, 0x05, 0xf9, 0x79, 0xc5, 0xa9, 0x4a,
	0x0c, 0x06, 0x8c, 0x4e, 0xda, 0x51, 0x9a, 0x65, 0x99, 0x25, 0xa9, 0xc5, 0xc5, 0x7a, 0x99, 0xf9,
	0xfa, 0x10, 0x96, 0x7e, 0x7a, 0xbe, 0x7e, 0x59, 0x89, 0x3e, 0xd8, 0x49, 0xfa, 0xc8, 0x0e, 0x4e,
	0x62, 0x03, 0x8b, 0x19, 0x03, 0x02, 0x00, 0x00, 0xff, 0xff, 0x9d, 0xb5, 0x06, 0x92, 0xdb, 0x00,
	0x00, 0x00,
}

// Reference imports to suppress errors if they are not otherwise used.
var _ context.Context
var _ grpc.ClientConn

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
const _ = grpc.SupportPackageIsVersion4

// VtctlClient is the client API for Vtctl service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://godoc.org/google.golang.org/grpc#ClientConn.NewStream.
type VtctlClient interface {
	ExecuteVtctlCommand(ctx context.Context, in *vtctldata.ExecuteVtctlCommandRequest, opts ...grpc.CallOption) (Vtctl_ExecuteVtctlCommandClient, error)
}

type vtctlClient struct {
	cc *grpc.ClientConn
}

func NewVtctlClient(cc *grpc.ClientConn) VtctlClient {
	return &vtctlClient{cc}
}

func (c *vtctlClient) ExecuteVtctlCommand(ctx context.Context, in *vtctldata.ExecuteVtctlCommandRequest, opts ...grpc.CallOption) (Vtctl_ExecuteVtctlCommandClient, error) {
	stream, err := c.cc.NewStream(ctx, &_Vtctl_serviceDesc.Streams[0], "/vtctlservice.Vtctl/ExecuteVtctlCommand", opts...)
	if err != nil {
		return nil, err
	}
	x := &vtctlExecuteVtctlCommandClient{stream}
	if err := x.ClientStream.SendMsg(in); err != nil {
		return nil, err
	}
	if err := x.ClientStream.CloseSend(); err != nil {
		return nil, err
	}
	return x, nil
}

type Vtctl_ExecuteVtctlCommandClient interface {
	Recv() (*vtctldata.ExecuteVtctlCommandResponse, error)
	grpc.ClientStream
}

type vtctlExecuteVtctlCommandClient struct {
	grpc.ClientStream
}

func (x *vtctlExecuteVtctlCommandClient) Recv() (*vtctldata.ExecuteVtctlCommandResponse, error) {
	m := new(vtctldata.ExecuteVtctlCommandResponse)
	if err := x.ClientStream.RecvMsg(m); err != nil {
		return nil, err
	}
	return m, nil
}

// VtctlServer is the server API for Vtctl service.
type VtctlServer interface {
	ExecuteVtctlCommand(*vtctldata.ExecuteVtctlCommandRequest, Vtctl_ExecuteVtctlCommandServer) error
}

// UnimplementedVtctlServer can be embedded to have forward compatible implementations.
type UnimplementedVtctlServer struct {
}

func (*UnimplementedVtctlServer) ExecuteVtctlCommand(req *vtctldata.ExecuteVtctlCommandRequest, srv Vtctl_ExecuteVtctlCommandServer) error {
	return status.Errorf(codes.Unimplemented, "method ExecuteVtctlCommand not implemented")
}

func RegisterVtctlServer(s *grpc.Server, srv VtctlServer) {
	s.RegisterService(&_Vtctl_serviceDesc, srv)
}

func _Vtctl_ExecuteVtctlCommand_Handler(srv interface{}, stream grpc.ServerStream) error {
	m := new(vtctldata.ExecuteVtctlCommandRequest)
	if err := stream.RecvMsg(m); err != nil {
		return err
	}
	return srv.(VtctlServer).ExecuteVtctlCommand(m, &vtctlExecuteVtctlCommandServer{stream})
}

type Vtctl_ExecuteVtctlCommandServer interface {
	Send(*vtctldata.ExecuteVtctlCommandResponse) error
	grpc.ServerStream
}

type vtctlExecuteVtctlCommandServer struct {
	grpc.ServerStream
}

func (x *vtctlExecuteVtctlCommandServer) Send(m *vtctldata.ExecuteVtctlCommandResponse) error {
	return x.ServerStream.SendMsg(m)
}

var _Vtctl_serviceDesc = grpc.ServiceDesc{
	ServiceName: "vtctlservice.Vtctl",
	HandlerType: (*VtctlServer)(nil),
	Methods:     []grpc.MethodDesc{},
	Streams: []grpc.StreamDesc{
		{
			StreamName:    "ExecuteVtctlCommand",
			Handler:       _Vtctl_ExecuteVtctlCommand_Handler,
			ServerStreams: true,
		},
	},
	Metadata: "vtctlservice.proto",
}
